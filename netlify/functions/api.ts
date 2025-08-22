import { Handler } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes';

const app = express();

// Setup the app
async function setupApp() {
  await registerRoutes(app);
  return app;
}

let handler: Handler;

export const handler: Handler = async (event, context) => {
  if (!handler) {
    const app = await setupApp();
    handler = serverless(app);
  }
  
  return handler(event, context);
};