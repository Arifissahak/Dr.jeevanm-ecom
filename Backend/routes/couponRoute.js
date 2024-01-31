const express = require('express');
const { createCoupon, getAllCoupons, updateCoupon, deleteCoupon } = require('../controller/couponCtrl');
const { authMidlleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/', authMidlleware, isAdmin, createCoupon);

router.put('/:id', authMidlleware, isAdmin, updateCoupon);

router.delete('/:id', authMidlleware, isAdmin, deleteCoupon);

router.get('/', authMidlleware, isAdmin, getAllCoupons);


module.exports = router;