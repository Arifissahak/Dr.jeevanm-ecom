const Blog = require("../models/blogsModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs');
//create blog only By Admin
const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json({ newBlog });
  } catch (error) {
    throw new Error(error);
  }
});

//update blog only By Admin
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({ updateBlog });
  } catch (error) {
    throw new Error(error);
  }
});

//get a blog Both Admin and User
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBlog = await Blog.findById(id).populate("likes");
    await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json({ getBlog });
  } catch (error) {
    throw new Error(error);
  }
});

//get all Blogs both admin and user
const getAllBlog = asyncHandler(async (req, res) => {
  try {
    const getBlogs = await Blog.find();
    res.json(getBlogs);
  } catch (error) {
    throw new Error(error);
  }
});

//Delete A Blog By admin Only
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteblog = await Blog.findByIdAndDelete(id);
    res.json(deleteblog);
  } catch (error) {
    throw new Error(error);
  }
});

// Like and Unlike the blogs Only By user
const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
  
    // Find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    // Find the login user
    const loginUserId = req?.user?._id;
  
    // Find if the user has liked the blog
    const likesArray = Array.isArray(blog?.likes) ? blog?.likes : [];
    const alreadyLiked = likesArray.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
  
    // Find if the user has disliked the blog
    const dislikesArray = Array.isArray(blog?.dislike) ? blog?.dislike : [];
    const alreadyDisliked = dislikesArray.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
  
    if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislike: loginUserId },
          isDisLike: false,
        },
        {
          new: true,
        }
      );
      res.json(blog);
    } else if (alreadyLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLike: false,
        },
        {
          new: true,
        }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: loginUserId },
          isLike: true,
        },
        {
          new: true,
        }
      );
      res.json(blog);
    }
  });
  
  // Dislike the blogs by the user
  const disLikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
  
    // Find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    // Find the login user
    const loginUserId = req?.user?._id;
  
    // Find if the user has liked the blog
    const likesArray = Array.isArray(blog?.likes) ? blog?.likes : [];
    const alreadyLiked = likesArray.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
  
    // Find if the user has disliked the blog
    const dislikesArray = Array.isArray(blog?.dislike) ? blog?.dislike : [];
    const alreadyDisliked = dislikesArray.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
  
    if (alreadyLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLike: false,
        },
        {
          new: true,
        }
      );
      res.json(blog);
    } else if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislike: loginUserId },
          isDisLike: false,
        },
        {
          new: true,
        }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { dislike: loginUserId },
          isDisLike: true,
        },
        {
          new: true,
        }
      );
      res.json(blog);
    }
  });


  const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
  
    try {
      const uploadImageToCloudinary = (path) => cloudinaryUploadImg(path, "images");
      const urls = [];
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        const newpath = await uploadImageToCloudinary(path);
        urls.push(newpath);
        fs.unlinkSync(path);
      }
  
      const findBlog = await Blog.findByIdAndUpdate(
        id,
        {
          images: urls.map((file) => {
            return file
          }),
        },
        {
          new: true,
        }
      );
  
      res.json(findBlog);
    } catch (error) {
      throw new Error(error);
    }
  });


module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  disLikeBlog,
  uploadImages,
};
