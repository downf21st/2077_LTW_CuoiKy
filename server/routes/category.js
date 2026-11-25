const express = require('express');
const attachUser = require('../middlewares/attachUser');
const requireUser = require('../middlewares/requireUser');
const { getCategories } = require('../controllers/recipeController');
const {
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.use(attachUser);
router.get('/', getCategories);
router.post('/', requireUser, createCategory);
router.put('/:id', requireUser, updateCategory);
router.delete('/:id', requireUser, deleteCategory);

module.exports = router;
