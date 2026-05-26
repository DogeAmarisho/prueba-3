-- ============================================================
-- SCRIPT SQL - Crear base de datos y tabla 'libros'
-- Ejecutar UNA SOLA VEZ antes de iniciar la aplicación
-- ============================================================

-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS biblioteca_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE biblioteca_db;

-- Eliminar la tabla si ya existe (para limpiar)
DROP TABLE IF EXISTS libros;

-- Crear la tabla 'libros'
CREATE TABLE libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    anio_publicacion INT NOT NULL,
    genero VARCHAR(50) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO libros (titulo, autor, anio_publicacion, genero, disponible) VALUES
('Cien años de soledad', 'Gabriel García Márquez', 1967, 'Realismo mágico', TRUE),
('El Quijote', 'Miguel de Cervantes', 1605, 'Novela', TRUE),
('La sombra del viento', 'Carlos Ruiz Zafón', 2001, 'Misterio', TRUE),
('1984', 'George Orwell', 1949, 'Ciencia ficción', FALSE),
('El principito', 'Antoine de Saint-Exupéry', 1943, 'Infantil', TRUE);
