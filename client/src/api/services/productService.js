const SIP = require('../models/sip');

const searchProducts = async (queryParams) => {
  const { searchTerm, category } = queryParams;
  //console.log('Service - Received Parameters:', { searchTerm, category });
  const query = {};

  console.log('Received searchTerm:', searchTerm);
  console.log('Received category:', category);

  if (searchTerm && searchTerm.trim() !== '') {
    const regex = new RegExp(searchTerm.trim(), 'i');
        query.$or = [
            { name: regex },
            { manufacturer: regex },
            { 'components.name': regex }
    ];
  }

  if (category && category.trim() !== '') {
    query.category = { 
        $regex: new RegExp(`^${category.trim()}$`, 'i') 
    };
}

console.log('Final Query:', JSON.stringify(query, null, 2));
  return SIP.find(query).lean();
};

const getProductDetails = async (productId) => {
  return SIP.findById(productId).lean();
};

module.exports = {
  searchProducts,
  getProductDetails
};