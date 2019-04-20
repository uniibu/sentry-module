process.env.NODE_ENV = 'production';
import * as path from 'path'
export default {
  srcDir: __dirname,
  env: {
    NODE_ENV: 'production'
  },
  loading: false,
  loadingIndicator: false,
  render: {
    resourceHints: false
  },
  dev: false,
  build: {
    extend(config, { isClient }) {
      if (isClient) {
        config.devtool = 'hidden-source-map'
      }
    }
  },
  modules: [
    require.resolve('../lib/module')
  ],
  sentry: {
    dsn: process.env.DSN,
    publishRelease: true,
    devtool: 'hidden-source-map',
    config: {
      environment: 'production'
    },
    properties: {
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      SENTRY_URL: 'https://sentry.io/',
      SENTRY_ORG: 'sentry-nuxt',
      SENTRY_PROJECT: 'sentry-nuxt',
    },
    webpackConfig: {
      release: '1.0.3',
      ignore: ['node_modules', 'fonts', 'images', 'LICENSES'],
      validate: true
    }
  }
}
