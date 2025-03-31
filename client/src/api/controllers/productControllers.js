const productService = require('../services/productService'); 

const searchProducts = async (req, res) => { 
    try {
        
        const { q: searchTerm, category } = req.query;
        
        
        const results = await productService.searchProducts({searchTerm, category});
        
        res.json({
            count: results.length,
            products: results
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed', details: error.message });
    }
};

const getProduct = async (req, res) => {
    try {
        const product = await productService.getProductDetails(req.params.id);
        product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
    } catch (error) {
        console.error('Product fetch error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = { 
    searchProducts, // Fixed function name spelling
    getProduct 
};