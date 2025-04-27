import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RetrievalQAChain } from 'langchain/chains';
import fs from 'fs/promises';
import path from 'path';

let cachedVectorStore = null;

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
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    // Parse request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { question } = body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    // Debug logs
    console.log(`Processing question: "${question}"`);

    // Initialize vector store
    if (!cachedVectorStore) {
      console.log('Initializing vector store...');
      const docPath = path.join(process.cwd(), 'public/docs/sip_data.txt');
      const rawText = await fs.readFile(docPath, 'utf8');
      
      const splitter = new RecursiveCharacterTextSplitter({ 
        chunkSize: 400, 
        chunkOverlap: 20 
      });
      
      const docs = await splitter.createDocuments([rawText]);
      
      cachedVectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings({ 
          openAIApiKey: process.env.OPENAI_API_KEY 
        })
      );
    }

    // Process query
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      maxTokens: 300
    });

    const chain = RetrievalQAChain.fromLLM(
      model, 
      cachedVectorStore.asRetriever()
    );

    const response = await chain.call({ query: question });

    return res.status(200).json({
      answer: response.text,
      sources: ['sip_data.txt']
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}