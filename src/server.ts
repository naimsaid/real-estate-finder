import { createServer } from 'node:http';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

const angularApp = new AngularNodeAppEngine();

export const reqHandler = createNodeRequestHandler(async (request, response, next) => {
  try {
    const webResponse = await angularApp.handle(request);
    if (webResponse) await writeResponseToNodeResponse(webResponse, response);
    else next();
  } catch (error) {
    next(error);
  }
});

if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] ?? 4000);
  createServer((request, response) =>
    reqHandler(request, response, (error) => {
      response.statusCode = error ? 500 : 404;
      response.end(error ? 'Internal Server Error' : 'Not Found');
    }),
  ).listen(port);
}
