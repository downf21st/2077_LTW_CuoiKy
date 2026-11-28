const express = require('express');
const { subscribe, unsubscribe } = require('../controllers/newsletterController');

const router = express.Router();
router.post('/subscribe', subscribe);
router.get('/unsubscribe/:token', unsubscribe);

module.exports = router;
