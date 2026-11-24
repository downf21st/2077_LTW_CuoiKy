const express = require('express');
const attachUser = require('../middlewares/attachUser');
const requireUser = require('../middlewares/requireUser');
const { login, register, updateProfile } = require('../controllers/userController');
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoriteController');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.put('/:id', attachUser, requireUser, updateProfile);
router.get('/:id/favorites', attachUser, requireUser, getFavorites);
router.post('/:id/favorites', attachUser, requireUser, addFavorite);
router.delete('/:id/favorites/:recipeId', attachUser, requireUser, removeFavorite);

module.exports = router;
