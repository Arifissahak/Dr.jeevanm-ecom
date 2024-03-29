const { generateToken } = require('../config/jwToken');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const { Error } = require('mongoose');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');
const Coupon = require('../models/couponModel');
const uniqid = require('uniqid');
const Order = require('../models/orderModel');

//create a user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email: email});
    if(!findUser) {
        //Create a new User
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        //User already Exists
        throw new Error("User Already Exists");
    }
});


//Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    //check if user already exist or not
    const findUser = await User.findOne({email});
    if(findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

//Login a Admin
const loginAdmiCtrl = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    //check if user already exist or not
    const findAdmin = await User.findOne({email});
    if(findAdmin.role !== "admin") throw new Error("Not Authorised");
    if(findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateuser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
                refreshToken: refreshToken,
            },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

//handle refresh Token
const handleRefreshToken = asyncHandler( async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cokies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) throw new Error("No Refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decode) => {
        if(err || user.id !== decode.id){
            throw new Error("There is something wrong with refresh token");
        };
        const accessToken = generateToken(user?._id);
        res.json({accessToken});
    });
});

//logout the user
const logout = asyncHandler( async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cokies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) {
        res.clearCookie("refreshToken", {
           httpOnly: true,
           secure: true,
        });
        return res.sendStatus(204);//forBidden
    }
    await User.findOneAndUpdate({ refreshToken: refreshToken }, { refreshToken: "",});
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
     });
    res.sendStatus(204);//forBidden
});

//update the user
const updateaUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            },
            {
                new: true,
            }
        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});

//Get all user list
const getAllUser = asyncHandler(async (req, res) => {
    try{
        const getUser = await User.find();
        res.json(getUser);
    } catch (error){
        throw new Error(error);
    }
});

//get A user
const getaUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try{
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

//Save User address
const saveAddress  = asyncHandler( async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address,
            },
            {
                new: true,
            }
        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
})

//Delete A user
const deleteAUser = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try{
        const deleteAUser = await User.findByIdAndDelete(id);
        res.json({
            deleteAUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try{
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        res.json(block);
    } catch (error) {
        throw new Error(error);
    }
});
const unBlockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try{
        const unBlock = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );
        res.json(unBlock);
    } catch (error) {
        throw new Error(error);
    }
});

//update password
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const {password} = req.body;
    console.log(_id);
    validateMongoDbId(_id);
    const user =  await User.findById(_id);
    if (password) {
        user.password = password;
        const updatePassword = await user.save();
        res.json(updatePassword);
    } else {
        res.json(user);
    }
  });

//Forgot password
const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if(!user) throw new Error("User not found with this email");
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            htm: resetURL
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

//reset the password through email
const resetPassword = asyncHandler( async (req, res) => {
    const { password } = req.body;
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if(!user) throw new Error("Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

//Get Wishlist products
const getWishlist =  asyncHandler(async (req, res) => {
    const {_id} = req.user;
    try{
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});

//User cart Function
const userCart = asyncHandler( async(req, res) => {
    const { cart } = req.body;
    const {_id } = req.user;
    validateMongoDbId(_id);
    try{
        let products = [];
        const user = await User.findById(_id);
        //check if user already have product in cart
        const alreadyExistCart = await Cart.findOne({ orderby: user._id});
        if (alreadyExistCart) {
            await Cart.deleteOne({ _id: alreadyExistCart._id });
        }            
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById( cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object)
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }
        console.log(products, cartTotal);
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
        }).save();
        // let newCart = await Cart.create({
        //     products,
        //     cartTotal,
        //     orderby: user?._id,
        // });
        // console.log(newCart);
        res.json(newCart);
    } catch (error) {
        throw new Error(error);
    }
});

//Get user cart
const getAuserCart = asyncHandler( async(req, res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    console.log(_id);
    try{
        const cart = await Cart.findOne({orderby: _id}).populate("products.product");
        console.log(cart);
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

//Empty the cart
const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const user = await User.findOne({ _id });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const cart = await Cart.findOneAndDelete({ orderby: user._id });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        res.json(cart);
    } catch (error) {
        console.error("Error emptying cart:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//Apply coupon
const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
        throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    let { products, cartTotal } = await Cart.findOne({
        orderby: user._id,
    }).populate("products.product");
    let totalAfterDiscount = (
        cartTotal - (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    // Corrected code for updating the cart with the discount
    const updatedCart = await Cart.findOneAndUpdate(
        { orderby: user._id },
        { totalAfterDiscount },
        { new: true }
    );
    // res.json(updatedCart);
    res.json(updatedCart.totalAfterDiscount);
});

//create order
const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      if (!COD) throw new Error("Create cash order failed");
      const user = await User.findById(_id);
      let userCart = await Cart.findOne({ orderby: user._id });
      let finalAmout = 0;
      if (couponApplied && userCart.totalAfterDiscount) {
        finalAmout = userCart.totalAfterDiscount;
      } else {
        finalAmout = userCart.cartTotal;
      }
  
      let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: uniqid(),
          method: "COD",
          amount: finalAmout,
          status: "Cash on Delivery",
          created: Date.now(),
          currency: "inr",
        },
        orderby: user._id,
        orderStatus: "Cash on Delivery",
      }).save();
      let update = userCart.products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      });
      const updated = await Product.bulkWrite(update, {});
      res.json({ message: "success" });
    } catch (error) {
      throw new Error(error);
    }
  });

//Get user order
const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const userorders = await Order.findOne({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
      res.json(userorders);
    } catch (error) {
      throw new Error(error);
    }
});

//Get user order
const getAllOrders = asyncHandler(async (req, res) => {
    try {
      const alluserorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
      res.json(alluserorders);
    } catch (error) {
      throw new Error(error);
    }
});

const getOrderByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const userorders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
      res.json(userorders);
    } catch (error) {
      throw new Error(error);
    }
});

//update the order status by Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateOrderStatus = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus: status,
          paymentIntent: {
            status: status,
          },
        },
        { new: true }
      );
      res.json(updateOrderStatus);
    } catch (error) {
      throw new Error(error);
    }
  });

module.exports = { 
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
                getAllOrders,
                getOrderByUserId,
                updateOrderStatus 
                };