const { json } = require("body-parser");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require('slugify');
const User = require('../models/userModel');
const validateMongoDbId = require('../utils/validateMongodbid');
const {cloudinaryUploadImg, cloudinaryDeleteImg } = require('../utils/cloudinary')
const fs = require('fs');
//create a product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if(req.body.title){
      req.body.slug = slugify(req.body.title);
    }
    const newProudct = await Product.create(req.body);
    res.json(newProudct);
  } catch (error) {
    throw new Error(error);
  }
});

//update a user
const updateProduct = asyncHandler( async( req, res) => {
  const id = req.params.id;
  try {
    if (req.body.title) {
      req.body.slug = slugify( req.body.title);
    }
    const updateProduct = await Product.findOneAndUpdate({ _id: id } , req.body, {
      new: true,
    })
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
})

//Delete a product
const deleteProduct = asyncHandler( async( req, res) => {
  const id = req.params.id;
  try {
    const deleteProduct = await Product.findOneAndDelete(id);
    // res.json(deleteProduct)
    res.json("The product is deleted");
  } catch (error) {
    throw new Error(error);
  }
})

//get a single product with id
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//Get all product and can filter the product
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    //Filtering
    const queryObj = {...req.query};
    const excludeFields = ["page","sort","limit","fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr));

    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //Limiting the fields
    if(req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v")
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    // console.log(page, limit, skip);

    const product = await query;
    res.json(product)
    
  } catch (error) {
    throw new Error(error);
  }
});

//Product added to wishList By a user
const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { proId } = req.body;
  try{
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find((id) => id.toString() === proId);
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: proId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: proId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
})

//Rating function
const rating = asyncHandler( async (req, res) => {
  const { _id } = req.user;
  const { star, proId, comment } = req.body;
  try{
    const product = await Product.findById(proId);
    let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        },
      );
    } else {
      const ratedProduct = await Product.findByIdAndUpdate(
        proId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    };
    const getAllRatings = await Product.findById(proId);
    let totalRating = getAllRatings.ratings.length;
    let ratingsum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalProduct = await Product.findByIdAndUpdate(
      proId,
      {
        totalrating: actualRating
      },
      {
        new: true
      }
    );
    res.json( finalProduct );
  } catch (error) {
    throw new Error(error);
  }
});






module.exports = { 
                   createProduct, 
                   getProduct, 
                   getAllProduct, 
                   updateProduct,
                   deleteProduct,
                   addToWishlist,
                   rating,
                 };
