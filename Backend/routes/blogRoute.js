const express = require('express');
const { 
        createBlog, 
        updateBlog, 
        getBlog, 
        getAllBlog, 
        deleteBlog, 
        likeBlog, 
        disLikeBlog,
        uploadImages
      } = require("../controller/blogCtrl");
const { isAdmin, authMidlleware } = require("../middlewares/authMiddleware");
const { blogImgResize, uploadPhoto } = require('../middlewares/uploadMiddlewere');
const router  = express.Router();

router.post("/", authMidlleware, isAdmin, createBlog);

router.put("/likes", authMidlleware, likeBlog);
router.put("/dislikes", authMidlleware, disLikeBlog);
router.put("/:id", authMidlleware, isAdmin, updateBlog);
router.put('/upload/:id', authMidlleware, isAdmin, uploadPhoto.array("images", 10), blogImgResize, uploadImages );

router.get("/:id", getBlog);
router.get("/", getAllBlog);

router.delete("/:id", authMidlleware, isAdmin, deleteBlog);



module.exports = router;