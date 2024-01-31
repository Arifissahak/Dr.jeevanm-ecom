const express = require('express');
const { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory } = require('../controller/blogCatCtrl');
const { authMidlleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMidlleware, isAdmin, createCategory );

router.put('/:id', authMidlleware, isAdmin, updateCategory );

router.delete('/:id', authMidlleware, isAdmin, deleteCategory);

router.get('/', getAllCategory);
router.get('/:id', getCategory);



module.exports = router;