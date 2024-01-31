const express = require('express');
const { createColor, updateColor, deleteColor, getColor, getAllColor } = require('../controller/colorCtrl');
const { authMidlleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMidlleware, isAdmin, createColor );

router.put('/:id', authMidlleware, isAdmin, updateColor );

router.delete('/:id', authMidlleware, isAdmin, deleteColor);

router.get('/', getAllColor);
router.get('/:id', getColor);



module.exports = router;