// ============================================================
// ARCHIVO: server.js
// PROPÓSITO: Punto de entrada de la aplicación
// Configura Express, middlewares y rutas
// ============================================================

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const librosRoutes = require('./routes/libros');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// 1. CORS - Permite peticiones desde el navegador
app.use(cors({
    origin: 'http://localhost:3000', // Permitir solo este origen
    credentials: true                 // Permitir enviar cookies
}));

// 2. Parsear JSON - Convierte el body de las peticiones a objeto JS
app.use(express.json());

// 3. Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// 4. Servir archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// CONFIGURACIÓN DE SESIONES (Seguridad)
// ============================================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_secreto_por_defecto',
    resave: false,           // No guardar la sesión si no cambió
    saveUninitialized: false, // No crear sesiones vacías
    cookie: {
        maxAge: 1000 * 60 * 60 * 8, // 8 horas de duración
        httpOnly: true,              // No accesible desde JavaScript (protege contra XSS)
        secure: false                // En desarrollo (HTTP), en producción debe ser true (HTTPS)
    }
}));

// ============================================================
// RUTAS DE LA API
// ============================================================

// Rutas de libros (prefijo /api/libros)
app.use('/api/libros', librosRoutes);

// ============================================================
// RUTAS DE AUTENTICACIÓN (simplificada para demostración)
// ============================================================

// Login simple - Crea la sesión
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    
    // Demo: usuario válido es "admin" con cualquier contraseña
    if (usuario === 'admin') {
        req.session.usuario = {
            id: 1,
            nombre: 'Administrador',
            usuario: 'admin',
            rol: 'admin'
        };
        
        res.status(200).json({
            ok: true,
            mensaje: 'Login exitoso',
            usuario: req.session.usuario
        });
    } else {
        res.status(401).json({
            ok: false,
            mensaje: 'Credenciales incorrectas'
        });
    }
});

// Logout - Destruye la sesión
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error al cerrar sesión' });
        }
        res.status(200).json({ ok: true, mensaje: 'Sesión cerrada correctamente' });
    });
});

// Verificar si hay sesión activa
app.get('/api/sesion', (req, res) => {
    if (req.session && req.session.usuario) {
        res.status(200).json({
            ok: true,
            autenticado: true,
            usuario: req.session.usuario
        });
    } else {
        res.status(200).json({ ok: true, autenticado: false });
    }
});

// ============================================================
// MANEJO DE ERRORES (404 - Ruta no encontrada)
// ============================================================
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: `La ruta ${req.originalUrl} no existe`
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log('========================================');
    console.log(`📚 API Biblioteca corriendo en:`);
    console.log(`   http://localhost:${PORT}`);
    console.log('========================================');
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   GET    /api/libros               - Listar libros`);
    console.log(`   GET    /api/libros/:id           - Obtener libro por ID`);
    console.log(`   POST   /api/libros               - Crear libro (requiere login)`);
    console.log(`   PUT    /api/libros/:id           - Actualizar libro (requiere login)`);
    console.log(`   DELETE /api/libros/:id           - Eliminar libro (requiere login)`);
    console.log(`   GET    /api/sesion               - Verificar sesión`);
    console.log(`   POST   /login                    - Iniciar sesión`);
    console.log(`   POST   /logout                   - Cerrar sesión`);
    console.log('========================================');
});
