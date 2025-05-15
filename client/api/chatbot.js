import { readFileSync } from 'fs';
import path from 'path';
// LangChain imports
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Global cache for vector store and text data
let vectorStore = null;
let sourceChunks = null;  // to hold the text chunks for reference (if needed)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const { question } = req.body;
  if (!question) {
    res.status(400).json({ error: 'Missing "question" in request body.' });
    return;
  }

  try {
    // Initialize vector store once (on first request or cold start)
    if (!vectorStore) {
      // Read the knowledge base text file from the filesystem
      const filePath = path.join(process.cwd(), 'public', 'docs', 'sip_data.txt');
      const fileContent = readFileSync(filePath, 'utf-8');

      // Split the text into manageable chunks for embedding
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
      });
      const docs = await splitter.createDocuments([fileContent]);
      // Optionally, add an ID or metadata to each chunk for reference
      docs.forEach((doc, index) => {
        doc.metadata = { source: `chunk_${index + 1}` };
      });
      sourceChunks = docs;  // save for reference use

      // Create OpenAI embeddings for each chunk and build the vector store
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
      // The vector store (in-memory) is now initialized and cached
    }

    // Use the vector store to find relevant chunks for the question
    const topK = 3;  // number of chunks to retrieve
    const relevantDocs = await vectorStore.similaritySearch(question, topK);
    const contextTexts = relevantDocs.map(doc => doc.pageContent);

    // Combine the retrieved texts into a single prompt for the OpenAI model
    const separator = "\n\n---\n\n";
    const contextBlock = contextTexts.join(separator);
    const prompt = 
      `You are a helpful assistant. Use the following information from our knowledge base to answer the question.\n${separator}${contextBlock}\n${separator}\nQuestion: ${question}\nAnswer:`;

    // Initialize a ChatOpenAI model (gpt-3.5-turbo by default)
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',    // or 'gpt-4' if available
      temperature: 0,                // deterministic, factual answers
    });

    // Query the model with the prompt. We use a single-turn prompt for simplicity.
    const response = await model.invoke([{ role: 'user', content: prompt }]);
    const answerText = response.content?.trim();

    // Prepare reference snippets for the response (e.g., first 100 chars of each source chunk)
    const references = relevantDocs.map((doc, idx) => {
      let snippet = doc.pageContent;
      if (snippet.length > 200) {
        snippet = snippet.slice(0, 200) + '...';  // truncate long chunks
      }
      return {
        id: idx + 1,
        text: snippet
      };
    });

    res.status(200).json({ answer: answerText, references });
  } catch (error) {
    console.error('Error in chatbot handler:', error);
    res.status(500).json({ error: 'Failed to process the question.' });
  }
}
