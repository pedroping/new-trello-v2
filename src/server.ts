import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  const angularNodeAppEngine = new AngularNodeAppEngine();

  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: 'index.html',
    }),
  );

  server.get('/404', (_, res) => {
    res.send('Express is serving this server only error');
  });

  server.get('**', (req, res, next) => {
    angularNodeAppEngine
      .handle(req, { server: 'express' })
      .then((response) => {
        const header = `
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data:;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
      `
          .replace(/\s+/g, ' ')
          .trim();

        res.setHeader('Content-Security-Policy', header);
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('x-content-type-options', 'nosniff');
        res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

        return response ? writeResponseToNodeResponse(response, res) : next();
      })
      .catch(next);
  });

  return server;
}

const server = app();
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 80;
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

console.warn('Node Express server started');

export const reqHandler = createNodeRequestHandler(server);
