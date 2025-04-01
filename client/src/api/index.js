const app = require('./app');

module.exports = async (req, res) => {
    // Convert Vercel request/res to Express format
    const { method, path, headers, body } = req;
    const expressReq = {
        method,
        path,
        headers,
        body: typeof body === 'string' ? JSON.parse(body) : body
    };

    const expressRes = {
        status: (code) => ({
            json: (data) => res.status(code).send(data),
            send: (data) => res.status(code).send(data)
        })
    };

    try {
        await app(expressReq, expressRes);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};