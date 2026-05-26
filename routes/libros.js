// ============================================================
// ARCHIVO: routes/libros.js
// CAPA 1: PRESENTACIÓN - Definición de rutas
// ============================================================

const express = require('express');
const router = express.Router();

// Importar controladores
const librosController = require('../controllers/librosController');

// Importar middlewares
const { verificarSesion } = require('../middlewares/authMiddleware');
const { loggerMiddleware } = require('../middlewares/loggerMiddleware');

// ============================================================
// RUTAS PÚBLICAS (no requieren autenticación)
// ============================================================

// GET /api/libros - Listar todos los libros (con soporte de búsqueda)
// Ejemplo: GET /api/libros?buscar=quijote
router.get('/', loggerMiddleware, librosController.listarLibros);

// GET /api/libros/:id - Obtener un libro por su ID
router.get('/:id', loggerMiddleware, librosController.obtenerLibro);

// ============================================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================================

// POST /api/libros - Crear un nuevo libro
router.post('/', verificarSesion, librosController.crearLibro);

// PUT /api/libros/:id - Actualizar un libro existente
router.put('/:id', verificarSesion, librosController.actualizarLibro);

// DELETE /api/libros/:id - Eliminar un libro
router.delete('/:id', verificarSesion, librosController.eliminarLibro);

module.exports = router;
