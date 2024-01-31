const express = require('express');
const { 
        uploadImages,
        deleteImages
      } = require('../controller/uploadCtrl');
const { isAdmin, authMidlleware } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadMiddlewere');
const router = express.Router();

router.post('/', authMidlleware, isAdmin, uploadPhoto.array("images", 10), productImgResize, uploadImages );

router.delete('/delete-img/:id', authMidlleware, isAdmin, deleteImages);



module.exports = router;