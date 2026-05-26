// ============================================================
// ARCHIVO: models/libroModel.js
// CAPA 3: DATOS - Único lugar que ejecuta consultas SQL
// ============================================================

const pool = require('../db/conexion');

/**
 * Obtener todos los libros de la base de datos
 * SELECT * FROM libros ORDER BY titulo
 * @returns {Promise<Array>} Lista de libros
 */
async function obtenerTodos() {
    try {
        const [filas] = await pool.query(
            'SELECT id, titulo, autor, anio_publicacion, genero, disponible FROM libros ORDER BY titulo ASC'
        );
        return filas;
    } catch (error) {
        throw new Error(`Error en obtenerTodos: ${error.message}`);
    }
}

/**
 * Obtener un libro por su ID
 * @param {number} id - ID del libro a buscar
 * @returns {Promise<Object|null>} El libro encontrado o null
 */
async function obtenerPorId(id) {
    try {
        const [filas] = await pool.query(
            'SELECT * FROM libros WHERE id = ?',
            [id]
        );
        return filas[0] || null; // Si no existe, retorna null
    } catch (error) {
        throw new Error(`Error en obtenerPorId: ${error.message}`);
    }
}

/**
 * Crear un nuevo libro en la base de datos
 * @param {Object} libro - Datos del libro { titulo, autor, anio_publicacion, genero, disponible }
 * @returns {Promise<Object>} El libro creado con su ID asignado
 */
async function crear(libro) {
    try {
        const [resultado] = await pool.query(
            `INSERT INTO libros (titulo, autor, anio_publicacion, genero, disponible) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                libro.titulo,
                libro.autor,
                libro.anio_publicacion,
                libro.genero,
                libro.disponible !== undefined ? libro.disponible : true
            ]
        );
        
        // resultado.insertId es el ID que MySQL asignó automáticamente
        return {
            id: resultado.insertId,
            ...libro
        };
    } catch (error) {
        throw new Error(`Error en crear: ${error.message}`);
    }
}

/**
 * Actualizar un libro existente
 * @param {number} id - ID del libro a actualizar
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<boolean>} true si se actualizó, false si no existía
 */
async function actualizar(id, datos) {
    try {
        const [resultado] = await pool.query(
            `UPDATE libros SET 
                titulo = COALESCE(?, titulo),
                autor = COALESCE(?, autor),
                anio_publicacion = COALESCE(?, anio_publicacion),
                genero = COALESCE(?, genero),
                disponible = COALESCE(?, disponible)
             WHERE id = ?`,
            [
                datos.titulo || null,
                datos.autor || null,
                datos.anio_publicacion || null,
                datos.genero || null,
                datos.disponible !== undefined ? datos.disponible : null,
                id
            ]
        );
        
        // affectedRows indica cuántas filas fueron modificadas
        return resultado.affectedRows > 0;
    } catch (error) {
        throw new Error(`Error en actualizar: ${error.message}`);
    }
}

/**
 * Eliminar un libro por su ID
 * @param {number} id - ID del libro a eliminar
 * @returns {Promise<boolean>} true si se eliminó, false si no existía
 */
async function eliminar(id) {
    try {
        const [resultado] = await pool.query(
            'DELETE FROM libros WHERE id = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    } catch (error) {
        throw new Error(`Error en eliminar: ${error.message}`);
    }
}

/**
 * Buscar libros por título o autor (función extra - opcional)
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Lista de libros que coinciden
 */
async function buscar(termino) {
    try {
        const [filas] = await pool.query(
            `SELECT * FROM libros 
             WHERE titulo LIKE ? OR autor LIKE ? 
             ORDER BY titulo ASC`,
            [`%${termino}%`, `%${termino}%`]
        );
        return filas;
    } catch (error) {
        throw new Error(`Error en buscar: ${error.message}`);
    }
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    buscar
};
