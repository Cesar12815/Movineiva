// src/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');

router.get('/', getFavorites);          // Listar favoritos del dispositivo
router.post('/', addFavorite);          // RF-05 + RB-03
router.delete('/:routeId', removeFavorite); // CU-03/A2: Eliminar favorito

module.exports = router;
