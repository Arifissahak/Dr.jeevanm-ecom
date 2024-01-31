const Enquiry = require('../models/enqModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

//Create Enquiry for product by ADMIN
const createEnquiry = asyncHandler( async(req, res) => {
    try{
        const newEnquiry = await Enquiry.create(req.body);
        res.json(newEnquiry);
    } catch (error) {
        throw new Error(error);
    };
});

//Update Enquiry for product by ADMIN
const updateEnquiry = asyncHandler( async(req, res) => {
    const { id }  = req.params;
    validateMongoDbId(id);
    try{
        const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, { new : true });
        res.json(updatedEnquiry);
    } catch (error) {
        throw new Error(error);
    };
});

//Delete Enquiry By Admin
const deleteEnquiry = asyncHandler( async(req, res) => {
    const { id }  = req.params;
    validateMongoDbId(id);
    try{
        const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
        res.json(deletedEnquiry);
    } catch (error) {
        throw new Error(error);
    };
});

//Get a Enquiry
const getEnquiry = asyncHandler( async(req, res) => {
    const { id }  = req.params;
    validateMongoDbId(id);
    try{
        const getaEnquiry = await Enquiry.findById(id);
        res.json(getaEnquiry);
    } catch (error) {
        throw new Error(error);
    };
});

//Get all Enquiry
const getAllEnquiry = asyncHandler( async(req, res) => {
    try{
        const getallEnquiry = await Enquiry.find();
        res.json(getallEnquiry);
    } catch (error) {
        throw new Error(error);
    };
});

module.exports = { createEnquiry, updateEnquiry, deleteEnquiry, getEnquiry, getAllEnquiry };