const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  try {
    // Reuse your frontend search logic in the backend
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        category,
        manufacturer,
        model_version,
        year_released,
        embedded_os,
        software_platform,
        connectivity,
        key_hardware_components,
        ai_ml_features,
        ota_update_support,
        open_source_used,
        power_source,
        retail_price_usd,
        dependencies,
        safety_compliance_certifications,
        official_product_url,
        app_ecosystem,
        third_party_review_link,
        market_region
      `)
      .or(`name.ilike.%${question}%,category.ilike.%${question}%,manufacturer.ilike.%${question}%,embedded_os.ilike.%${question}%`);

    if (error) throw error;

    let formatted = 'No matching products found.';
    if (products.length > 0) {
      formatted = products.map(p => {
        return `• ${p.name} (${p.category}) by ${p.manufacturer}, ${p.year_released}. OS: ${p.embedded_os || 'N/A'}, AI: ${p.ai_ml_features || 'None'}, Price: $${p.retail_price_usd || 'N/A'}`;
      }).join('\n');
    }

    const prompt = `User question: "${question}"\n\nRelevant products from the database:\n${formatted}\n\nNow generate a helpful, concise response for the user using this information.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    return res.status(200).json({
      answer: response.choices[0].message.content.trim(),
      references: products.map(p => ({
        id: p.id,
        text: `${p.name} - $${p.retail_price_usd}`
      }))
    });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
