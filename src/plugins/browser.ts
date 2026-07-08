import fp from 'fastify-plugin';

import { closeBrowsers } from '#lib/browser';

export default fp(
  async (app) => {
    app.addHook('onClose', () => closeBrowsers());
  },
  { name: 'browser' },
);
