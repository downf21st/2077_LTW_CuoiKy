const express = require('express');
const { getCategories } = require('../controllers/recipeController');

const router = express.Router();

router.get('/', getCategories);

module.exports = router;