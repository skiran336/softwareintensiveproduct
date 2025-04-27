import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs/promises';
import path from 'path';

let vectorStore;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Initialize vector store once
    if (!vectorStore) {
      const filePath = path.join(process.cwd(), 'public/docs/sip_data.txt');
      
      // Verify file exists
      try {
        await fs.access(filePath, fs.constants.R_OK);
      } catch (err) {
        throw new Error('Knowledge base file not found');
      }

      const knowledgeBase = await fs.readFile(filePath, 'utf8');

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([knowledgeBase]);
      
      vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: "text-embedding-ada-002"
        })
      );
    }

    const { question, history } = req.body;
    
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 500,
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(3) // Top 3 relevant chunks
    );

    const response = await chain.call({
      question,
      chat_history: history || [],
    });

    res.status(200).json({
      answer: response.text,
      sources: response.sourceDocuments?.map(d => ({
        content: d.pageContent.substring(0, 150) + '...',
        metadata: d.metadata
      })) || []
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
    });
  }
}