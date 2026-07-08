import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

import { adapterFor } from '#adapters/index';
import { parseBody, parseError, parseResult } from './schemas.ts';

const routes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '',
    {
      schema: {
        body: parseBody,
        response: { 200: parseResult, 422: parseError, 502: parseError },
      },
    },
    async (request, reply) => {
      const { url } = request.body;
      const adapter = adapterFor(url);

      if (!adapter) {
        reply.code(422);
        return { message: `no adapter for ${new URL(url).hostname}` };
      }

      try {
        return await adapter(url);
      } catch (error) {
        reply.code(502);
        return { message: error instanceof Error ? error.message : String(error) };
      }
    },
  );
};

export default routes;
