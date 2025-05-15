// File: api/chatbot.js (Hybrid: OpenAI + Supabase + Local Embeddings)
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY);

let knowledgeBase = [];

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

function loadKnowledgeBase() {
  if (knowledgeBase.length > 0) return;
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

    // 1. Search Supabase
    const { data: products, error: supabaseError } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${question}%,category.ilike.%${question}%,manufacturer.ilike.%${question}%,embedded_os.ilike.%${question}%`);

    if (supabaseError) console.error('Supabase error:', supabaseError);

    const formattedSupabase = (products || []).map(p =>
      `• ${p.name} (${p.category}) by ${p.manufacturer}, ${p.year_released}. OS: ${p.embedded_os || 'N/A'}, AI: ${p.ai_ml_features || 'None'}, Price: $${p.retail_price_usd || 'N/A'}`
    ).join('\n');

    // 2. Search local embeddings
    const embeddingResp = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question
    });
    const qEmbedding = embeddingResp.data[0].embedding;

    const topChunks = knowledgeBase
      .map(entry => ({ text: entry.text, score: cosineSimilarity(entry.embedding, qEmbedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const formattedSIPChunks = topChunks.map(c => c.text).join('\n---\n');

    // 3. Construct GPT prompt
    const prompt = `User question: "${question}"

Products from Supabase:\n${formattedSupabase || 'No matching products.'}

Relevant knowledge base chunks:\n${formattedSIPChunks || 'No semantic matches.'}

Answer clearly using all information.`;

    const chatResp = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    res.status(200).json({
      answer: chatResp.choices[0].message.content.trim(),
      sources: [
        ...topChunks.map((c, i) => ({ id: `SIP-${i + 1}`, content: c.text.slice(0, 200) + '...' })),
        ...(products || []).slice(0, 3).map(p => ({ id: `DB-${p.id}`, content: `${p.name} – $${p.retail_price_usd}` }))
      ]
    });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
