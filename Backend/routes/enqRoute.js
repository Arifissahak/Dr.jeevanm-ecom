const express = require('express');
const { createEnquiry, updateEnquiry, deleteEnquiry, getEnquiry, getAllEnquiry } = require('../controller/enqCtrl');
const { authMidlleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', createEnquiry );

router.put('/:id', authMidlleware, isAdmin, updateEnquiry );

router.delete('/:id', authMidlleware, isAdmin, deleteEnquiry);

router.get('/', getAllEnquiry);
router.get('/:id', getEnquiry);



module.exports = router;