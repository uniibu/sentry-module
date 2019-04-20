# @bitsler/sentry
[![npm (scoped with tag)](https://img.shields.io/npm/v/@bitsler/sentry/latest.svg?style=flat-square)](https://npmjs.com/package/@bitsler/sentry)
[![npm](https://img.shields.io/npm/dt/@bitsler/sentry.svg?style=flat-square)](https://npmjs.com/package/@bitsler/sentry)
[![Dependencies](https://david-dm.org/nuxt-community/sentry-module/status.svg?style=flat-square)](https://david-dm.org/nuxt-community/sentry-module)
[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com)

> Forked from [@nuxt/sentry](https://github.com/nuxt-community/sentry-module) that uses `hidden-source-map`. A Sentry module for Nuxt.js

## Features

The module enables error logging through [Sentry](http://sentry.io).

- **Please note** that version 2.2.0 of this package removed the older `public_key` and `private_key` options, since the updated Sentry packages don't support these anymore.
- **Please note** that version 2.0.0 of this package introduces a breaking change. See [#30](https://github.com/nuxt-community/sentry-module/pull/30) for more information.

## Setup
- Add `@nuxtjs/sentry` dependency using yarn or npm to your project
- Add `@nuxtjs/sentry` to `modules` section of `nuxt.config.js`

```js
{
  modules: [
    '@nuxtjs/sentry',
  ],

  sentry: {
    dsn: '', // Enter your project's DSN here
    config: {}, // Additional config
  }
}
```

### Nuxt compatibility
Versions of NuxtJS before v2.4.0 are **not** supported by this package.

## Usage

Enter your DSN in the NuxtJS config file. Additional config settings can be found [here](https://docs.sentry.io/clients/javascript/config/).

### Usage in Vue component

In a Vue component, `Sentry` is available as `this.$sentry`, so we can call functions like

```
this.$sentry.captureException(new Error('example'))
```

where `this` is a Vue instance.

## Options

Options can be passed using either environment variables or `sentry` section in `nuxt.config.js`.
Normally setting required DSN information would be enough.

### dsn
- Type: `String`
  - Default: `process.env.SENTRY_DSN || false`
  - If no `dsn` is provided, Sentry will be initialised, but errors will not be logged. See [#47](https://github.com/nuxt-community/sentry-module/issues/47) for more information about this.

### disabled
- Type: `Boolean`
  - Default: `process.env.SENTRY_DISABLED || false`
  - Sentry will not be initialised if set to `true`.

### disableClientSide
- Type: `Boolean`
  - Default: `process.env.SENTRY_DISABLE_CLIENT_SIDE || false`

### disableServerSide
- Type: `Boolean`
  - Default: `process.env.SENTRY_DISABLE_SERVER_SIDE || false`

### initialize
- Type: `Boolean`
  - Default: `process.env.SENTRY_INITIALIZE || true`

### publishRelease
- Type: `Boolean`
  - Default: `process.env.SENTRY_PUBLISH_RELEASE || false`
  - See https://docs.sentry.io/workflow/releases for more information

### disableServerRelease
- Type: `Boolean`
  - Default: `process.env.SENTRY_DISABLE_SERVER_RELEASE || false`
  - See https://docs.sentry.io/workflow/releases for more information

### disableClientRelease
- Type: `Boolean`
  - Default: `process.env.SENTRY_DISABLE_CLIENT_RELEASE || false`
  - See https://docs.sentry.io/workflow/releases for more information

### clientIntegrations
- Type: `Dictionary`
  - Default:
  ```
   {
      Dedupe: {},
      ExtraErrorData: {},
      ReportingObserver: {},
      RewriteFrames: {},
      Vue: {attachProps: true}
   }
  ```
  - See https://docs.sentry.io/platforms/node/pluggable-integrations/ for more information

### serverIntegrations
- Type: `Dictionary`
  - Default:
  ```
    {
      Dedupe: {},
      ExtraErrorData: {},
      RewriteFrames: {},
      Transaction: {}
    }
  ```
  - See https://docs.sentry.io/platforms/node/pluggable-integrations/ for more information

### config
- Type: `Object`
  - Default: `{
    environment: this.options.dev ? 'development' : 'production'
  }`

### serverConfig
- Type: `Object`
  - Default: `{
  }`
  - If specified, values will override config values for server sentry plugin

### clientConfig
- Type: `Object`
  - Default: `{
  }`
  - If specified, values will override config values for client sentry plugin

## Submitting releases to Sentry
Support for the [sentry-webpack-plugin](https://github.com/getsentry/sentry-webpack-plugin) was introduced [#a6cd8d3](https://github.com/nuxt-community/sentry-module/commit/a6cd8d3b983b4c6659e985736b19dc771fe7c9ea). This can be used to send releases to Sentry. Use the publishRelease  option to enable this feature.

Note that releases are only submitted to Sentry when `(options.publishRelease && !isDev)` is true.

Required: You must set either `options.properties` or  `webpackConfig.configFile` to your `.sentryclirc` file or `sentry.properties` file.

### properties
- Type: `Object`
  - Default: `{
    SENTRY_AUTH_TOKEN: undefined, // can be found at API keys options under the User menu
    SENTRY_API_KEY: undefined, // legacy/deprecated api key
    SENTRY_URL: undefined, // The URL to use to connect to sentry. This defaults to https://sentry.io/
    SENTRY_ORG: undefined, // The slug of the organization to use for a command.
    SENTRY_PROJECT: undefined // The slug of the project to use for a command.
  }`
  - If specified, no need to pass `webpackConfig.configFile`. Values will be passed as environment values to `sentry-webpack-plugin`

### devtool
- Type: `String`
  - Default: `#source-map`

### webpackConfig
- Type: `Object`
  - Default:
  ```
  {
      include: [],
      ignore: [
        'node_modules',
        '.nuxt/dist/client/img'
      ],
      ignoreFile: '.sentrycliignore',
      urlPrefix: publicPath.startsWith('/') ? `~${publicPath}` : publicPath,
    }
  ```
  - Values will be passed to `sentry-webpack-plugin`. More options can be found at `https://github.com/getsentry/sentry-webpack-plugin`


## License
[MIT License](./LICENSE)

Copyright (c) Diederik van den Burger <diederik@glue.group>
