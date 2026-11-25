const express = require('express');
const attachUser = require('../middlewares/attachUser');
const requireUser = require('../middlewares/requireUser');
const { getMenu, saveMenu, deleteMenu } = require('../controllers/menuController');

const router = express.Router();
router.use(attachUser, requireUser);
router.get('/:userId', getMenu);
router.put('/:userId', saveMenu);
router.delete('/:userId', deleteMenu);

module.exports = router;
