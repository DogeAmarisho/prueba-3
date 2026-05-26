// ============================================================
// ARCHIVO: middlewares/authMiddleware.js
// PROPÓSITO: Verificar que el usuario tenga sesión activa
// ============================================================

/**
 * Middleware para verificar que el usuario está autenticado
 * Se ejecuta ANTES de las rutas protegidas
 */
function verificarSesion(req, res, next) {
    // Verificar si existe la sesión y tiene datos de usuario
    if (req.session && req.session.usuario) {
        // Usuario autenticado → continuar
        return next();
    }
    
    // Usuario no autenticado → responder con 401 Unauthorized
    res.status(401).json({
        ok: false,
        mensaje: 'Acceso denegado. Debes iniciar sesión primero',
        redirigir: '/login.html'
    });
}

/**
 * Middleware para crear una sesión después del login
 * (se usa en la ruta POST /login)
 */
function crearSesion(req, res, usuario) {
    req.session.usuario = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol || 'usuario'
    };
}

/**
 * Middleware para destruir la sesión (logout)
 */
function destruirSesion(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir sesión:', err);
        }
    });
}

module.exports = { verificarSesion, crearSesion, destruirSesion };

// NUEVO: Middleware para la API Key
const API_KEY = 'eval-s12-2024';

function verificarApiKey(req, res, next) {
    const keyRecibida = req.headers['x-api-key'];

    if (!keyRecibida || keyRecibida !== API_KEY) {
        return res.status(401).json({
            ok: false,
            error: 'API key inválida o ausente'
        });
    }
    next();
}

// Actualiza el module.exports para incluir verificarApiKey
module.exports = { verificarSesion, crearSesion, destruirSesion, verificarApiKey };
