import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

let vectorStore = global.vectorStore || null;

const handler = async (req, res) => {
  // Enable CORS
  cors()(req, res, () => {});

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question, history } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Missing question in request body' });
  }

  try {
    // Dynamic imports with error handling
    let ChatOpenAI, OpenAIEmbeddings, ConversationalRetrievalQAChain, MemoryVectorStore, RecursiveCharacterTextSplitter;
    
    try {
      const langchainOpenAI = await import("@langchain/openai");
      const langchainCommunity = await import("@langchain/community");
      const langchainTextSplitter = await import("@langchain/community/text_splitter");
      
      ChatOpenAI = langchainOpenAI.ChatOpenAI;
      OpenAIEmbeddings = langchainOpenAI.OpenAIEmbeddings;
      ConversationalRetrievalQAChain = langchainCommunity.ConversationalRetrievalQAChain;
      MemoryVectorStore = langchainCommunity.MemoryVectorStore;
      RecursiveCharacterTextSplitter = langchainTextSplitter.RecursiveCharacterTextSplitter;
    } catch (importError) {
      console.error("Import Error:", importError);
      return res.status(500).json({ error: "Failed to load required modules" });
    }

    // Initialize vector store only once (per serverless warm instance)
    if (!vectorStore) {
      console.log("Initializing vector store...");

      try {
        const filePath = path.join(process.cwd(), 'public', 'docs', 'sip_data.txt');
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

        global.vectorStore = vectorStore;
        console.log("Vector store ready.");
      } catch (initError) {
        console.error("Vector Store Initialization Error:", initError);
        return res.status(500).json({ error: "Failed to initialize vector store" });
      }
    }

    // Set up Chat Model and QA Chain
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
    console.error("API Error:", error);

    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error'
    });
  }
};

export default handler;
