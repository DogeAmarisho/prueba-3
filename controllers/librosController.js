// ============================================================
// ARCHIVO: controllers/librosController.js
// CAPA 2: NEGOCIO - Validaciones y lógica de la aplicación
// ============================================================

const LibroModel = require('../models/libroModel');

// Expresiones regulares para validaciones
const PATRONES = {
    // Letras, espacios y tildes, mínimo 2 caracteres
     o: /^[a-zA-ZáéíóúñÑ\s]{2,150}$/,
    // Números entre 1000 y 2026 (años de publicación válidos)
    anio: /^(19[0-9]{2}|20[0-2][0-6])$/,
    // Letras y espacios para género
    genero: /^[a-zA-ZáéíóúñÑ\s]{3,50}$/
};

/**
 * CONTROLADOR: Listar todos los libros
 * GET /api/libros
 */
async function listarLibros(req, res) {
    try {
        // Verificar si hay parámetro de búsqueda
        const { buscar: terminoBusqueda } = req.query;
        
        let libros;
        if (terminoBusqueda && terminoBusqueda.trim() !== '') {
            // Hay término de búsqueda
            libros = await LibroModel.buscar(terminoBusqueda);
        } else {
            // Listar todos
            libros = await LibroModel.obtenerTodos();
        }
        
        res.status(200).json({
            ok: true,
            total: libros.length,
            datos: libros
        });
        
    } catch (error) {
        console.error('Error en listarLibros:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * CONTROLADOR: Obtener un libro por ID
 * GET /api/libros/:id
 */
async function obtenerLibro(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        // Validación: ID debe ser un número positivo
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID debe ser un número entero positivo'
            });
        }
        
        const libro = await LibroModel.obtenerPorId(id);
        
        // Validación: el libro debe existir
        if (!libro) {
            return res.status(404).json({
                ok: false,
                mensaje: `No se encontró el libro con ID ${id}`
            });
        }
        
        res.status(200).json({
            ok: true,
            datos: libro
        });
        
    } catch (error) {
        console.error('Error en obtenerLibro:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor'
        });
    }
}

/**
 * CONTROLADOR: Crear un nuevo libro
 * POST /api/libros
 */
async function crearLibro(req, res) {
    try {
        const { titulo, autor, anio_publicacion, genero, disponible } = req.body;
        
        // ============================================================
        // VALIDACIONES - Capa de negocio
        // ============================================================
        
        // 1. Validar campos obligatorios
        const errores = [];
        
        if (!titulo || titulo.trim() === '') {
            errores.push('El título es obligatorio');
        } else if (!PATRONES. o.test(titulo)) {
            errores.push('El título debe tener entre 2 y 150 caracteres (solo letras y espacios)');
        }
        
        if (!autor || autor.trim() === '') {
            errores.push('El autor es obligatorio');
        } else if (!PATRONES. o.test(autor)) {
            errores.push('El autor debe tener entre 2 y 150 caracteres (solo letras y espacios)');
        }
        
        if (!anio_publicacion) {
            errores.push('El año de publicación es obligatorio');
        } else if (!PATRONES.anio.test(anio_publicacion.toString())) {
            errores.push('El año debe ser entre 1000 y 2026');
        }
        
        if (!genero || genero.trim() === '') {
            errores.push('El género es obligatorio');
        } else if (!PATRONES.genero.test(genero)) {
            errores.push('El género debe tener entre 3 y 50 caracteres');
        }
        
        // Si hay errores, responder con código 400
        if (errores.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error de validación',
                errores: errores
            });
        }
        
        // 2. Crear el libro en la base de datos
        const nuevoLibro = await LibroModel.crear({
            titulo: titulo.trim(),
            autor: autor.trim(),
            anio_publicacion: parseInt(anio_publicacion),
            genero: genero.trim(),
            disponible: disponible !== undefined ? disponible : true
        });
        
        // 3. Responder con código 201 (Created)
        res.status(201).json({
            ok: true,
            mensaje: 'Libro creado exitosamente',
            datos: nuevoLibro
        });
        
    } catch (error) {
        console.error('Error en crearLibro:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor'
        });
    }
}

/**
 * CONTROLADOR: Actualizar un libro existente
 * PUT /api/libros/:id
 */
async function actualizarLibro(req, res) {
    try {
        const id = parseInt(req.params.id);
        const { titulo, autor, anio_publicacion, genero, disponible } = req.body;
        
        // Validar ID
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID debe ser un número entero positivo'
            });
        }
        
        // Verificar que el libro existe
        const libroExistente = await LibroModel.obtenerPorId(id);
        if (!libroExistente) {
            return res.status(404).json({
                ok: false,
                mensaje: `No se encontró el libro con ID ${id}`
            });
        }
        
        // Validar campos (solo los que se envían)
        const datosActualizar = {};
        
        if (titulo !== undefined) {
            if (!PATRONES. o.test(titulo)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El título debe tener entre 2 y 150 caracteres'
                });
            }
            datosActualizar.titulo = titulo.trim();
        }
        
        if (autor !== undefined) {
            if (!PATRONES. o.test(autor)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El autor debe tener entre 2 y 150 caracteres'
                });
            }
            datosActualizar.autor = autor.trim();
        }
        
        if (anio_publicacion !== undefined) {
            if (!PATRONES.anio.test(anio_publicacion.toString())) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El año debe ser entre 1000 y 2026'
                });
            }
            datosActualizar.anio_publicacion = parseInt(anio_publicacion);
        }
        
        if (genero !== undefined) {
            if (!PATRONES.genero.test(genero)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El género debe tener entre 3 y 50 caracteres'
                });
            }
            datosActualizar.genero = genero.trim();
        }
        
        if (disponible !== undefined) {
            datosActualizar.disponible = disponible === true || disponible === 'true';
        }
        
        // Realizar la actualización
        const actualizado = await LibroModel.actualizar(id, datosActualizar);
        
        if (!actualizado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se pudo actualizar el libro'
            });
        }
        
        // Obtener el libro actualizado
        const libroActualizado = await LibroModel.obtenerPorId(id);
        
        res.status(200).json({
            ok: true,
            mensaje: 'Libro actualizado exitosamente',
            datos: libroActualizado
        });
        
    } catch (error) {
        console.error('Error en actualizarLibro:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor'
        });
    }
}

/**
 * CONTROLADOR: Eliminar un libro
 * DELETE /api/libros/:id
 */
async function eliminarLibro(req, res) {
    try {
        const id = parseInt(req.params.id);
        
        // Validar ID
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID debe ser un número entero positivo'
            });
        }
        
        // Verificar que el libro existe
        const libroExistente = await LibroModel.obtenerPorId(id);
        if (!libroExistente) {
            return res.status(404).json({
                ok: false,
                mensaje: `No se encontró el libro con ID ${id}`
            });
        }
        
        // Eliminar el libro
        const eliminado = await LibroModel.eliminar(id);
        
        if (!eliminado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se pudo eliminar el libro'
            });
        }
        
        res.status(200).json({
            ok: true,
            mensaje: `Libro "${libroExistente.titulo}" eliminado exitosamente`
        });
        
    } catch (error) {
        console.error('Error en eliminarLibro:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor'
        });
    }
}

module.exports = {
    listarLibros,
    obtenerLibro,
    crearLibro,
    actualizarLibro,
    eliminarLibro
};
