const { OpenAI } = require('@langchain/openai');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// Initialize vector store only once
let knowledgeBase = null;

const initializeKnowledgeBase = async () => {
  if (!knowledgeBase) {
    try {
      const sipData = await fs.readFile(
        path.join(process.cwd(), 'sip_data.txt'),
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

const handler = async (req, res) => {
  // Enable CORS
  cors()(req, res, () => {});

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, history } = req.body;

    // Initialize knowledge base
    const kb = await initializeKnowledgeBase();

    // Initialize OpenAI
    const model = new OpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // Create context from knowledge base
    const context = kb.join('\n');

    // Create prompt
    const prompt = `You are a helpful assistant for SIP (Systematic Investment Plan) products. 
    Use the following knowledge base to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    
    Knowledge Base:
    ${context}
    
    Chat History:
    ${history ? history.map(h => `${h.role}: ${h.content}`).join('\n') : 'None'}
    
    Question: ${question}
    
    Helpful Answer:`;

    // Get response from OpenAI
    const response = await model.invoke(prompt);

    return res.status(200).json({ answer: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = handler;
