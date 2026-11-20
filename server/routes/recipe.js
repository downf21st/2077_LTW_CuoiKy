const express = require('express');
const attachUser = require('../middlewares/attachUser');
const requireUser = require('../middlewares/requireUser');
const upload = require('../middlewares/upload');
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
router.post('/', requireUser, upload.single('image'), createRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', requireUser, upload.single('image'), updateRecipe);
router.delete('/:id', requireUser, deleteRecipe);

module.exports = router;
