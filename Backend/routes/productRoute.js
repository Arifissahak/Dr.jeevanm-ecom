const express = require('express');
const { 
        createProduct, 
        getProduct, 
        getAllProduct, 
        updateProduct, 
        deleteProduct,
        addToWishlist,
        rating,
      } = require('../controller/productctrl');
const { isAdmin, authMidlleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMidlleware, isAdmin, createProduct);

router.get('/', getAllProduct);
router.get('/:id', getProduct);

router.put('/rating', authMidlleware, rating);
router.put('/wishlist', authMidlleware, addToWishlist);
router.put('/:id', authMidlleware, isAdmin, updateProduct);


router.delete('/:id', authMidlleware, isAdmin, deleteProduct);



module.exports = router;