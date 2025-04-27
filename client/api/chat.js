import { ChatOpenAI } from "@langchain/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from 'fs/promises';
import path from 'path';

let vectorStore;
let initializing = false;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Request validation
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!req.body?.question) {
      return res.status(400).json({ error: 'Missing question in request body' });
    }

    // Initialize vector store
    if (!vectorStore && !initializing) {
      initializing = true;
      console.log("Initializing vector store...");
      
      const filePath = path.join(process.cwd(), 'public', 'docs', 'sip_data.txt');
      console.log("Knowledge base path:", filePath);

      try {
        await fs.access(filePath, fs.constants.R_OK);
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

        console.log("Vector store initialized successfully");
      } catch (err) {
        console.error("Vector store initialization failed:", err);
        throw err;
      } finally {
        initializing = false;
      }
    } else if (initializing) {
      return res.status(503).json({ error: 'System initializing, please try again in 10 seconds' });
    }

    // Process request
    const { question, history } = req.body;
    
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 500,
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(3)
    );

    const response = await chain.call({
      question,
      chat_history: history || [],
    });

    return res.status(200).json({
      answer: response.text,
      sources: response.sourceDocuments?.map(d => ({
        content: d.pageContent.substring(0, 150) + '...',
        metadata: d.metadata
      })) || []
    });

  } catch (error) {
    console.error("API Error Details:", {
      error: error.message,
      stack: error.stack,
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Exists" : "Missing",
        NODE_ENV: process.env.NODE_ENV
      }
    });

    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          stack: error.stack,
          message: error.message
        }
      })
    });
  }
}