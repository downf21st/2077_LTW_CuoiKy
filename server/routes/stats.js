const express = require('express');
const attachUser = require('../middlewares/attachUser');
const requireUser = require('../middlewares/requireUser');
const { getStats } = require('../controllers/statsController');

const router = express.Router();
router.use(attachUser, requireUser);
router.get('/', getStats);

module.exports = router;
