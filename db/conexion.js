// ============================================================
// ARCHIVO: db/conexion.js
// PROPÓSITO: Configurar y exportar la conexión a MySQL
// ============================================================

const mysql = require('mysql2');
require('dotenv').config(); // Carga las variables de entorno desde .env

// Crear el pool de conexiones
// Un pool mantiene múltiples conexiones reutilizables
// Es más eficiente que abrir/cerrar una conexión en cada petición
const pool = mysql.createPool({
    host: process.env.DB_HOST,     // 'localhost' o IP del servidor MySQL
    user: process.env.DB_USER,     // Usuario (por defecto 'root')
    password: process.env.DB_PASSWORD, // Contraseña (vacía por defecto en XAMPP)
    database: process.env.DB_NAME, // 'biblioteca_db'
    port: 3306,                    // Puerto por defecto de MySQL
    waitForConnections: true,      // Espera si no hay conexiones disponibles
    connectionLimit: 10,           // Máximo 10 conexiones simultáneas
    queueLimit: 0                  // Sin límite de peticiones en cola
});

// Convertir el pool a Promesas para usar async/await
// Esto permite usar await pool.promise().query() en lugar de callbacks
const poolPromise = pool.promise();

// Verificar la conexión al iniciar el servidor
async function verificarConexion() {
    try {
        const connection = await poolPromise.getConnection();
        console.log('✅ Conectado a MySQL correctamente');
        console.log(`📀 Base de datos: ${process.env.DB_NAME}`);
        console.log(`🌐 Host: ${process.env.DB_HOST}`);
        connection.release(); // Devuelve la conexión al pool
    } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error.message);
        console.error('   Verifica que MySQL esté corriendo y las credenciales sean correctas');
        process.exit(1); // Detiene la aplicación si no hay base de datos
    }
}

verificarConexion();

// Exportar el pool para que los modelos lo usen
module.exports = poolPromise;
