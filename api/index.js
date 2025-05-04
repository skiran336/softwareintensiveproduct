const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize knowledge base
let knowledgeBase = null;

const initializeKnowledgeBase = async () => {
  if (!knowledgeBase) {
    try {
      const sipData = await fs.readFile(
        path.join(__dirname, 'sip_data.txt'),
        'utf-8'
      );
      knowledgeBase = sipData.split('\n').filter(text => text.trim());
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      throw error;
    }
  }
  return knowledgeBase;
};

app.post('/chat', async (req, res) => {
  try {
    const { question, history } = req.body;

    // Initialize knowledge base
    const kb = await initializeKnowledgeBase();

    // Create context from knowledge base
    const context = kb.join('\n');

    // Create messages array
    const messages = [
      {
        role: 'system',
        content: `You are a helpful assistant for SIP (Systematic Investment Plan) products. 
        Use the following knowledge base to answer questions.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        Knowledge Base:
        ${context}`
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
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 