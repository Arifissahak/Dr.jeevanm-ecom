const Coupon = require('../models/couponModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

//Create a new coupon
const createCoupon = asyncHandler( async (req, res) => {
    try{
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch (error) {
        throw new Error(error);
      }
});

//Get All Coupon
const getAllCoupons = asyncHandler( async (req, res) => {
    try{
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        throw new Error(error);
      }
});

//Update the Coupon
const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try{
        const updatecoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatecoupon);
    } catch (error) {
        throw new Error(error);
      }
});

//Delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try{
        const deletedcoupon = await Coupon.findByIdAndDelete(id);
        res.json(deletedcoupon);
    } catch (error) {
        throw new Error(error);
      }
});

module.exports = { createCoupon, getAllCoupons, updateCoupon, deleteCoupon };