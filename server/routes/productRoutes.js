const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

// GET /api/products/search?searchTerm=tesla&category=Cars
router.get('/search', productController.searchProducts);

// GET /api/products/:id
router.get('/:id', productController.getProduct);

router.get('/', async (req, res) => {
    res.json({ message: "Products endpoint working!" });
  });

module.exports = router;