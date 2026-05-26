// services/libroService.js

const PATRONES = {
    texto: /^[a-zA-ZáéíóúñÑ\s]{2,150}$/,
    anio: /^(1[0-9]{3}|20[0-2][0-6])$/,
    genero: /^[a-zA-ZáéíóúñÑ\s]{3,50}$/
};

function validarDatos(body) {
    const { titulo, autor, anio_publicacion, genero } = body;
    const errores = [];

    if (!titulo || titulo.trim() === '') errores.push('El título es obligatorio');
    else if (!PATRONES.texto.test(titulo)) errores.push('El título debe tener entre 2 y 150 caracteres');

    if (!autor || autor.trim() === '') errores.push('El autor es obligatorio');
    else if (!PATRONES.texto.test(autor)) errores.push('El autor debe tener entre 2 y 150 caracteres');

    if (!anio_publicacion) errores.push('El año de publicación es obligatorio');
    else if (!PATRONES.anio.test(anio_publicacion.toString())) errores.push('El año debe ser entre 1000 y 2026');

    if (!genero || genero.trim() === '') errores.push('El género es obligatorio');
    else if (!PATRONES.genero.test(genero)) errores.push('El género debe tener entre 3 y 50 caracteres');

    if (errores.length > 0) {
        return { valido: false, error: errores.join(' | ') };
    }
    return { valido: true };
}

function prepararItem(body) {
    return {
        titulo: body.titulo.trim(),
        autor: body.autor.trim(),
        anio_publicacion: parseInt(body.anio_publicacion),
        // Normalizamos el género a minúsculas como pide el requerimiento
        genero: body.genero.trim().toLowerCase(), 
        disponible: body.disponible !== undefined ? (body.disponible === true || body.disponible === 'true') : true
    };
}

module.exports = { validarDatos, prepararItem };