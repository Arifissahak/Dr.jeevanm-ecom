const express = require('express');
const { createBrand, updateBrand, deleteBrand, getBrand, getAllBrand } = require('../controller/brandCtrl');
const { authMidlleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMidlleware, isAdmin, createBrand );

router.put('/:id', authMidlleware, isAdmin, updateBrand );

router.delete('/:id', authMidlleware, isAdmin, deleteBrand);

router.get('/', getAllBrand);
router.get('/:id', getBrand);



module.exports = router;