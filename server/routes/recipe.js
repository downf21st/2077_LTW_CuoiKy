const express = require('express');
const attachUser = require('../middlewares/attachUser');
const {
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} = require('../controllers/recipeController');

const router = express.Router();

router.use(attachUser);
router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;