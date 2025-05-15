// File: api/chatbot.js (Vercel Serverless Function)
import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

let knowledgeBase = [];

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

function loadKnowledgeBase() {
  if (knowledgeBase.length > 0) return; // Already loaded
  const filePath = path.join(process.cwd(), 'public', 'docs', 'sip_embeddings.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  knowledgeBase = JSON.parse(raw);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    loadKnowledgeBase();

    const embeddingResp = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: question
    });
    const qEmbedding = embeddingResp.data.data[0].embedding;

    const topChunks = knowledgeBase
      .map(entry => ({
        text: entry.text,
        score: cosineSimilarity(entry.embedding, qEmbedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const context = topChunks.map(c => c.text).join('\n---\n');
    const prompt = `Use the following information to answer the question.\n\n${context}\n\nQ: ${question}\nA:`;

    const chatResp = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    res.status(200).json({
      answer: chatResp.data.choices[0].message.content.trim(),
      sources: topChunks.map((c, i) => ({ id: i + 1, content: c.text.slice(0, 200) + '...' }))
    });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
