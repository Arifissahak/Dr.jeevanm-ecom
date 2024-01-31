const Color = require('../models/colorModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

//Create Color for product by ADMIN
const createColor = asyncHandler( async(req, res) => {
    try{
        const newColor = await Color.create(req.body);
        res.json(newColor);
    } catch (error) {
        throw new Error(error);
    };
});

//Update Color for product by ADMIN
const updateColor = asyncHandler( async(req, res) => {
    const { id }  = req.params;
    validateMongoDbId(id);
    try{
        const updatedColor = await Color.findByIdAndUpdate(id, req.body, { new : true });
        res.json(updatedColor);
    } catch (error) {
        throw new Error(error);
    };
});

//Delete Color By Admin
const deleteColor = asyncHandler( async(req, res) => {
    const { id }  = req.params;
    validateMongoDbId(id);
    try{
        const deletedColor = await Color.findByIdAndDelete(id);
        res.json(deletedColor);
    } catch (error) {
        throw new Error(error);
    };
});

//Get a Color
const getColor = asyncHandler( async(req, res) => {
    const { id }  = req.params;
    validateMongoDbId(id);
    try{
        const getaColor = await Color.findById(id);
        res.json(getaColor);
    } catch (error) {
        throw new Error(error);
    };
});

//Get all Color
const getAllColor = asyncHandler( async(req, res) => {
    try{
        const getallColor = await Color.find();
        res.json(getallColor);
    } catch (error) {
        throw new Error(error);
    };
});

module.exports = { createColor, updateColor, deleteColor, getColor, getAllColor };