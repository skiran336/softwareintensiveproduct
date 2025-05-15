// File: api/chatbot.js (Vercel Serverless Function using OpenAI v4 SDK)
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let knowledgeBase = [];

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

function loadKnowledgeBase() {
  if (knowledgeBase.length > 0) return; // Already loaded
  const filePath = path.join(__dirname, '..', 'public', 'docs', 'sip_embeddings.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  knowledgeBase = JSON.parse(raw);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    loadKnowledgeBase();

    const embeddingResp = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question
    });
    const qEmbedding = embeddingResp.data[0].embedding;

    const topChunks = knowledgeBase
      .map(entry => ({
        text: entry.text,
        score: cosineSimilarity(entry.embedding, qEmbedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const context = topChunks.map(c => c.text).join('\n---\n');
    const prompt = `Use the following information to answer the question.\n\n${context}\n\nQ: ${question}\nA:`;

    const chatResp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    res.status(200).json({
      answer: chatResp.choices[0].message.content.trim(),
      sources: topChunks.map((c, i) => ({ id: i + 1, content: c.text.slice(0, 200) + '...' }))
    });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
