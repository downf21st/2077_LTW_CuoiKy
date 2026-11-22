const express = require('express');
const attachUser = require('../middlewares/attachUser');
const requireUser = require('../middlewares/requireUser');
const upload = require('../middlewares/upload');
const serializeRecipeWrites = require('../middlewares/serializeRecipeWrites');
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
} = require('../controllers/recipeController');

const router = express.Router();

router.use(attachUser);
router.get('/', getRecipes);
router.post('/', requireUser, upload.single('image'), serializeRecipeWrites, createRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', requireUser, upload.single('image'), serializeRecipeWrites, updateRecipe);
router.delete('/:id', requireUser, serializeRecipeWrites, deleteRecipe);

module.exports = router;
