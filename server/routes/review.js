const express = require('express');
const attachUser = require('../middlewares/attachUser');
const { getAdminReviews } = require('../controllers/reviewController');

const router = express.Router();
router.use(attachUser);
router.get('/', getAdminReviews);

module.exports = router;
