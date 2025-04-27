import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RetrievalQAChain } from 'langchain/chains';
import fs from 'fs';
import path from 'path';

let cachedVectorStore = null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { question } = req.body;

  try {
    if (!cachedVectorStore) {
      const docPath = path.resolve('./public/docs/sip_data.txt');
      const rawText = fs.readFileSync(docPath, 'utf8');

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

    res.status(200).json({
      answer: response.text,
      sources: ['sip_data.txt']
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
