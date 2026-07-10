import fp from 'fastify-plugin';

import { closeBrowser } from '#lib/browser';

export default fp(
  async (app) => {
    app.addHook('onClose', () => closeBrowser());
  },
  { name: 'browser' },
);
