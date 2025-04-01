const serverless = require('serverless-http');
const app = require('./app');

// Wrap Express app with serverless-http for Vercel compatibility
module.exports.handler = serverless(app);