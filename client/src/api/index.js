const serverless = require('serverless-http');
const app = require('./app');

// Serverless-specific error handling
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return await handler(event, context);
};