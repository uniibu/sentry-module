import VueLib from 'vue';
import * as Sentry from '@sentry/browser';

import { <%= Object.keys(options.integrations).map(integration => integration).join(', ') %> } from '@sentry/integrations';

export default function(ctx, inject) {
  VueLib.config.errorHandler = (err) => {
    Sentry.captureException(new Error(err))
  }
  const opts = Object.assign({}, <%= JSON.stringify(options.config, null, 2) %>, {
    integrations: [
      <%= Object.keys(options.integrations).map(name => {
        const integration = options.integrations[name];
        if (name === 'Vue') {
          return `      new ${name}({ Vue:VueLib, attachProps: ${integration.attachProps ? true : false} })`;
        }
        return `new ${name}({${Object.keys(integration).map(option => typeof integration[option] === 'function' ?
          `${option}:${serializeFunction(integration[option])}` : `${option}:${JSON.stringify(integration[option], null, 2)}`).join(',')}})`;
      }).join(',\n') %>
    ]
  });

  if (opts.initialize) {
    Sentry.init(opts);
  }

  // Inject Sentry to the context as $sentry
  inject('sentry', Sentry);
}
