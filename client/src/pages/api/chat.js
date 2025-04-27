import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RetrievalQAChain } from 'langchain/chains';
import fs from 'fs/promises';
import path from 'path';

let cachedVectorStore = null;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Method check
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    // Validate request body
    const { question } = req.body;
    
    if (!question?.trim()) {
      return res.status(400).json({ error: 'Question required' });
    }

    if (question.length > 500) {
      return res.status(400).json({ error: 'Question too long' });
    }

    // Initialize vector store
    if (!cachedVectorStore) {
      const docPath = path.join(process.cwd(), 'public/docs/sip_data.txt');
      const rawText = await fs.readFile(docPath, 'utf8');
      
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 400,
        chunkOverlap: 20,
      });
      
      const docs = await splitter.createDocuments([rawText]);
      
      cachedVectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: 'text-embedding-ada-002'
        })
      );
    }

    // Process query
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.2,
      maxTokens: 500,
      timeout: 10000 // 10 seconds
    });

    const chain = RetrievalQAChain.fromLLM(
      model,
      cachedVectorStore.asRetriever(3) // Return top 3 matches
    );

    const response = await chain.call({
      query: question,
    });

    return res.status(200).json({
      answer: response.text,
      sources: ['sip_data.txt'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
    });
  }
}