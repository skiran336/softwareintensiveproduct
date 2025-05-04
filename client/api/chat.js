import { OpenAI } from '@langchain/openai';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { fs } from 'fs';
import { path } from 'path';
import cors from 'cors';

const handler = async (req, res) => {
  // Enable CORS
  cors()(req, res, () => {});

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, history } = req.body;

    // Initialize OpenAI
    const model = new OpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // Initialize vector store
    let vectorStore;
    try {
      const sipData = await fs.promises.readFile(
        path.join(process.cwd(), 'sip_data.txt'),
        'utf-8'
      );
      const texts = sipData.split('\n').filter(text => text.trim());
      vectorStore = await HNSWLib.fromTexts(
        texts,
        texts.map((_, i) => ({ id: i })),
        new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY })
      );
    } catch (error) {
      console.error('Error initializing vector store:', error);
      return res.status(500).json({ error: 'Error initializing vector store' });
    }

    // Create the chain
    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: async (input) => {
          const relevantDocs = await vectorStore.similaritySearch(input.question, 3);
          return formatDocumentsAsString(relevantDocs);
        },
      },
      {
        input: new PromptTemplate({
          inputVariables: ['context', 'question', 'chat_history'],
          template: `You are a helpful assistant for SIP (Systematic Investment Plan) products. 
          Use the following pieces of context to answer the question at the end.
          If you don't know the answer, just say that you don't know, don't try to make up an answer.
          
          Context: {context}
          
          Chat History: {chat_history}
          
          Question: {question}
          
          Helpful Answer:`
        }),
      },
      model,
      new StringOutputParser(),
    ]);

    // Run the chain
    const response = await chain.invoke({
      question,
      chat_history: history || [],
    });

    return res.status(200).json({ answer: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
