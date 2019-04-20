import * as path from 'path';
import * as fs from 'fs';
import * as Sentry from '@sentry/node';
import WebpackPlugin from '@sentry/webpack-plugin';
import deepMerge from 'deepmerge';
import * as Integrations from '@sentry/integrations';
import consola from 'consola';
const logger = consola.withScope('nuxt:sentry');

const filterDisabledIntegration = integrations => Object.keys(integrations)
  .filter(key => integrations[key]);

export default function sentry(moduleOptions) {
  const publicPath = this.options.build.publicPath;
  const buildDirResolve = path.relative(this.options.rootDir, this.options.buildDir);
  const serverEnabled = this.options.mode !== 'spa';
  const defaults = {
    dsn: process.env.SENTRY_DSN || false,
    disabled: process.env.SENTRY_DISABLED || false,
    initialize: process.env.SENTRY_INITIALIZE || true,
    disableClientSide: process.env.SENTRY_DISABLE_CLIENT_SIDE || false,
    disableServerSide: process.env.SENTRY_DISABLE_SERVER_SIDE || false,
    publishRelease: process.env.SENTRY_PUBLISH_RELEASE || false,
    disableServerRelease: process.env.SENTRY_DISABLE_SERVER_RELEASE || false,
    disableClientRelease: process.env.SENTRY_DISABLE_CLIENT_RELEASE || false,
    clientIntegrations: {
      CaptureConsole: { levels: ['warn', 'error', 'assert'] },
      Dedupe: {},
      ExtraErrorData: {},
      ReportingObserver: {},
      RewriteFrames: {},
      Vue: { attachProps: true }
    },
    serverIntegrations: {
      CaptureConsole: { levels: ['warn', 'error', 'assert'] },
      Dedupe: {},
      ExtraErrorData: {},
      RewriteFrames: {},
      Transaction: {}
    },
    config: {
      environment: this.options.dev ? 'development' : 'production'
    },
    serverConfig: {},
    clientConfig: {},
    properties: {
      SENTRY_AUTH_TOKEN: undefined,
      SENTRY_API_KEY: undefined,
      SENTRY_URL: undefined,
      SENTRY_ORG: undefined,
      SENTRY_PROJECT: undefined
    },
    webpackConfig: {
      include: [],
      ignore: [
        'node_modules',
        '.nuxt/dist/client/img'
      ],
      ignoreFile: '.sentrycliignore',
      urlPrefix: publicPath.startsWith('/') ? `~${publicPath}` : publicPath
    }
  };

  const topLevelOptions = this.options.sentry || {};
  const options = deepMerge.all([defaults, topLevelOptions, moduleOptions]);

  options.serverConfig = deepMerge.all([options.config, options.serverConfig]);
  options.clientConfig = deepMerge.all([options.config, options.clientConfig]);

  if (!options.disableServerRelease && serverEnabled) {
    options.webpackConfig.include.push(`${buildDirResolve}/dist/server`);
  }
  if (!options.disableClientRelease) {
    options.webpackConfig.include.push(`${buildDirResolve}/dist/client`);
  }

  if (options.config.release && !options.webpackConfig.release) {
    options.webpackConfig.release = options.config.release;
  }
  if (!options.properties && !options.webpackConfig.configFile) {
    logger.info('Errors will not be logged because no properties or configFile has been provided');
    return;
  }

  if (options.disabled) {
    logger.info('Errors will not be logged because the disable option has been set');
    return;
  }

  if (!options.dsn) {
    logger.info('Errors will not be logged because no DSN has been provided');
    return;
  }
  if (options.webpackConfig.configFile && !fs.existsSync(options.webpackConfig.configFile)) {
    logger.info(`Errors will not be logged because configFile does not exists at ${options.webpackConfig.configFile}`);
    return;
  }
  // set properties to environment variables
  if (options.properties) {
    for (const prop of Object.keys(options.properties)) {
      if (options.properties[prop]) {
        process.env[prop] = options.properties[prop];
      }
    }
  }
  // Register the client plugin
  if (!options.disableClientSide) {
    logger.success('Client Initialize');
    this.addPlugin({
      src: path.resolve(__dirname, 'sentry.client.js'),
      fileName: 'sentry.client.js',
      mode: 'client',
      options: {
        config: {
          dsn: options.dsn,
          ...options.clientConfig
        },
        initialize: options.initialize,
        integrations: filterDisabledIntegration(options.clientIntegrations)
          .reduce((res, key) => {
            res[key] = options.clientIntegrations[key];
            return res;
          }, {})
      }
    });
  }
  // Register the server plugin
  if (!options.disableServerSide && serverEnabled) {
    // Initialize Sentry
    logger.success('Server Initialize');
    if (options.initialize) {
      Sentry.init({
        dsn: options.dsn,
        ...options.serverConfig,
        integrations: filterDisabledIntegration(options.serverIntegrations)
          .map(name => new Integrations[name](options.serverIntegrations[name]))
      });
    }

    process.sentry = Sentry;
    logger.success('Started logging errors to Sentry');

    this.addPlugin({
      src: path.resolve(__dirname, 'sentry.server.js'),
      fileName: 'sentry.server.js',
      mode: 'server'
    });
    this.nuxt.hook('render:setupMiddleware', app => app.use(Sentry.Handlers.requestHandler()));
    this.nuxt.hook('render:errorMiddleware', app => app.use(Sentry.Handlers.errorHandler()));
    this.nuxt.hook('generate:routeFailed', ({ route, errors }) => {
      errors.forEach(({ error }) => Sentry.withScope((scope) => {
        scope.setExtra('route', route);
        Sentry.captureException(error);
      }));
    });
  }

  // Enable publishing of sourcemaps
  this.extendBuild((config, { isClient, isModern, isDev }) => {
    if (!options.publishRelease || isDev) return;
    config.devtool = options.devtool || '#source-map';
    // when not in spa mode upload only at server build
    if (isClient && this.options.mode !== 'spa') return;

    logger.info(`Enabling uploading of release for ${isClient ? 'client' : 'server'} using ${config.devtool} to Sentry`);
    config.plugins.push(new WebpackPlugin(options.webpackConfig));
  });
};
