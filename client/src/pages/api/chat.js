import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RetrievalQAChain } from 'langchain/chains';
import fs from 'fs/promises';
import path from 'path';

let cachedVectorStore = null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required in request body.' });
  }

  try {
    if (!cachedVectorStore) {
      const docPath = path.resolve('./public/docs/sip_data.txt');

      // Read file asynchronously
      const rawText = await fs.readFile(docPath, 'utf8');

      const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 400, chunkOverlap: 20 });
      const docs = await splitter.createDocuments([rawText]);

      cachedVectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY })
      );
    }

    const model = new ChatOpenAI({ 
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      maxTokens: 300
    });

    const chain = RetrievalQAChain.fromLLM(model, cachedVectorStore.asRetriever());
    const response = await chain.call({ query: question });

    res.setHeader('Cache-Control', 'no-store');  // Prevent Vercel caching
    return res.status(200).json({
      answer: response.text,
      sources: ['sip_data.txt']
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
