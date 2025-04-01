const serverless = require('serverless-http');
const app = require('./app');

// Export the serverless-wrapped Express app
module.exports.handler = serverless(app);