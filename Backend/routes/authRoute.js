const express = require('express');
const { 
        createUser, 
        loginUserCtrl, 
        getAllUser, 
        getaUser, 
        deleteAUser, 
        updateaUser, 
        blockUser,
        unBlockUser,
        handleRefreshToken,
        logout,
        updatePassword,
        forgotPasswordToken,
        resetPassword,
        loginAdmiCtrl,
        getWishlist,
        saveAddress,
        userCart,
        getAuserCart,
        emptyCart,
        applyCoupon,
        createOrder,
        getOrders,
        getOrderByUserId,
        updateOrderStatus,
        getAllOrders
        } = require('../controller/userCtrl');
const { authMidlleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUserCtrl);
router.post('/admin-login', loginAdmiCtrl);
router.post('/cart/applycoupon',authMidlleware, applyCoupon);
router.post('/cart/cash-order', authMidlleware, createOrder);
router.post('/cart',authMidlleware, userCart);
router.post('/forgot-password-token', forgotPasswordToken);

router.get('/all-user',getAllUser);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get('/get-cart', authMidlleware, getAuserCart);
router.get('/get-order', authMidlleware, getOrders);
router.get('/getallorders', authMidlleware, isAdmin, getAllOrders);
router.post('/getallorderbyuser/:id', authMidlleware, isAdmin, getOrderByUserId);
router.get('/:id', authMidlleware, getWishlist);
router.get('/wishlist', authMidlleware, isAdmin, getaUser);

router.delete('/empty-cart', authMidlleware, emptyCart);
router.delete('/:id', deleteAUser);

router.put('/reset-password/:token', resetPassword);
router.put('/password',authMidlleware, updatePassword);
router.put('/edit-user', authMidlleware, updateaUser);
router.put('/save-address', authMidlleware, saveAddress);
router.put('/order/update-order/:id', authMidlleware, isAdmin, updateOrderStatus);
router.put('/block-user/:id', authMidlleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMidlleware, isAdmin, unBlockUser);

module.exports = router;