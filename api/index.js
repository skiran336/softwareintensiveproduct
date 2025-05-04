const { OpenAI } = require('openai');
const cors = require('cors');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const handler = async (req, res) => {
  // Enable CORS
  cors()(req, res, () => {});

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, history } = req.body;

    // Create messages array
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant for SIP (Systematic Investment Plan) products. If you don\'t know the answer, just say that you don\'t know, don\'t try to make up an answer.'
      },
      ...(history || []),
      { role: 'user', content: question }
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return res.status(200).json({ 
      answer: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = handler; 