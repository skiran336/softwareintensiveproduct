module.exports = {
    clientId: process.env.TESLA_CLIENT_ID,
    clientSecret: process.env.TESLA_CLIENT_SECRET,
    redirectUri: process.env.TESLA_REDIRECT_URI,
    scopes: 'openid vehicle_device_data offline_access',
    authUrl: 'https://auth.tesla.com/oauth2/v3/authorize',
    tokenUrl: 'https://auth.tesla.com/oauth2/v3/token',
    apiBaseUrl: 'https://fleet-api.prd.na.vn.cloud.tesla.com/api/1'
  };