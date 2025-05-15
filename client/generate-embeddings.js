// File: generate-embeddings.js (OpenAI v4+)
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
   const filePath = path.join(__dirname, 'public', 'docs', 'sip_data.txt');
  const text = fs.readFileSync(filePath, 'utf8');

  const chunks = text.match(/(.|[\r\n]){1,1000}/g).map(c => c.trim());
  console.log(`Creating embeddings for ${chunks.length} chunks...`);

  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: chunks
  });

  const embedded = chunks.map((text, i) => ({
    text,
    embedding: response.data[i].embedding
  }));

  const outPath = path.join(__dirname, 'public', 'docs', 'sip_embeddings.json');
  fs.writeFileSync(outPath, JSON.stringify(embedded, null, 2));

  console.log('✅ Embeddings saved to public/docs/sip_embeddings.json');
}

main().catch(err => {
  console.error('❌ Failed to generate embeddings:', err);
});
