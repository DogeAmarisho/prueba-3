// ============================================================
// ARCHIVO: middlewares/loggerMiddleware.js
// PROPÓSITO: Registrar cada petición HTTP en la consola
// ============================================================

function loggerMiddleware(req, res, next) {
    const timestamp = new Date().toLocaleTimeString('es-CL');
    const metodo = req.method;
    const url = req.originalUrl;
    
    console.log(`[${timestamp}] ${metodo} ${url}`);
    
    // next() es obligatorio para continuar con el siguiente middleware/controlador
    next();
}

module.exports = { loggerMiddleware };
