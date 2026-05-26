// ============================================================
// ARCHIVO: public/js/app.js
// Frontend - Consume la API con Fetch
// ============================================================

const API_BASE = '/api/libros';

// Estado de la aplicación
let estaAutenticado = false;
let libros = [];

// ============================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================

async function login(usuario, password) {
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            estaAutenticado = true;
            mostrarUIUsuario(data.usuario);
            cargarLibros();
            return true;
        } else {
            alert('Error: ' + data.mensaje);
            return false;
        }
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error de conexión');
        return false;
    }
}

async function logout() {
    try {
        await fetch('/logout', { method: 'POST' });
        estaAutenticado = false;
        mostrarUILogin();
        document.getElementById('listaLibros').innerHTML = '<p>Inicia sesión para ver los libros</p>';
    } catch (error) {
        console.error('Error en logout:', error);
    }
}

async function verificarSesion() {
    try {
        const response = await fetch('/api/sesion');
        const data = await response.json();
        
        if (data.autenticado) {
            estaAutenticado = true;
            mostrarUIUsuario(data.usuario);
            cargarLibros();
        } else {
            mostrarUILogin();
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        mostrarUILogin();
    }
}

// ============================================================
// FUNCIONES DE UI
// ============================================================

function mostrarUIUsuario(usuario) {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('nombreUsuario'). Content = usuario.nombre;
    document.getElementById('gestionLibros').style.display = 'block';
}

function mostrarUILogin() {
    document.getElementById('loginCard').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('gestionLibros').style.display = 'none';
}

function renderizarListaLibros() {
    const contenedor = document.getElementById('listaLibros');
    
    if (!libros || libros.length === 0) {
        contenedor.innerHTML = '<p>📭 No hay libros registrados. Agrega uno nuevo.</p>';
        return;
    }
    
    let html = '';
    libros.forEach(libro => {
        const estadoDisponible = libro.disponible 
            ? '<span class="disponible">✓ Disponible</span>' 
            : '<span class="no-disponible">✗ No disponible</span>';
        
        html += `
            <div class="libro-item" data-id="${libro.id}">
                <div class="libro-info">
                    <div class="libro-titulo">📖 ${escapeHTML(libro.titulo)}</div>
                    <div class="libro-autor">✍️ ${escapeHTML(libro.autor)}</div>
                    <div class="libro-detalle">
                        📅 ${libro.anio_publicacion} | 🏷️ ${escapeHTML(libro.genero)} | ${estadoDisponible}
                    </div>
                </div>
                <div class="libro-acciones">
                    <button class="btn-editar" onclick="mostrarEditar(${libro.id})">✏️ Editar</button>
                    <button class="btn-eliminar" onclick="eliminarLibro(${libro.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
}

function escapeHTML(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================================
// FUNCIONES CRUD
// ============================================================

async function cargarLibros(termino = '') {
    try {
        let url = API_BASE;
        if (termino && termino.trim() !== '') {
            url += `?buscar=${encodeURIComponent(termino)}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok) {
            libros = data.datos;
            renderizarListaLibros();
        } else {
            console.error('Error al cargar libros:', data.mensaje);
        }
    } catch (error) {
        console.error('Error en cargarLibros:', error);
        document.getElementById('listaLibros').innerHTML = '<p style="color:red">Error al cargar libros</p>';
    }
}

async function crearLibro(libroData) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(libroData)
        });
        
        const data = await response.json();
        
        if (data.ok) {
            alert('✅ Libro agregado exitosamente');
            document.getElementById('libroForm').reset();
            cargarLibros();
        } else {
            alert('❌ Error: ' + (data.mensaje || data.errores?.join(', ') || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error en crearLibro:', error);
        alert('Error de conexión');
    }
}

async function actualizarLibro(id, libroData) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(libroData)
        });
        
        const data = await response.json();
        
        if (data.ok) {
            alert('✅ Libro actualizado exitosamente');
            cargarLibros();
        } else {
            alert('❌ Error: ' + (data.mensaje || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error en actualizarLibro:', error);
        alert('Error de conexión');
    }
}

async function eliminarLibro(id) {
    if (!confirm('¿Estás seguro de eliminar este libro?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.ok) {
            alert('✅ Libro eliminado exitosamente');
            cargarLibros();
        } else {
            alert('❌ Error: ' + data.mensaje);
        }
    } catch (error) {
        console.error('Error en eliminarLibro:', error);
        alert('Error de conexión');
    }
}

// Función para mostrar edición (simplificada - prompt)
function mostrarEditar(id) {
    const libro = libros.find(l => l.id === id);
    if (!libro) return;
    
    const nuevoTitulo = prompt('Nuevo título:', libro.titulo);
    if (nuevoTitulo && nuevoTitulo !== libro.titulo) {
        actualizarLibro(id, { titulo: nuevoTitulo });
    }
}

// ============================================================
// VALIDACIÓN DEL FORMULARIO (Frontend)
// ============================================================

function validarFormularioLibro(titulo, autor, anio, genero) {
    const errores = [];
    
    if (!titulo || titulo.trim().length < 2) {
        errores.push('El título debe tener al menos 2 caracteres');
    }
    
    if (!autor || autor.trim().length < 2) {
        errores.push('El autor debe tener al menos 2 caracteres');
    }
    
    if (!anio || anio < 1000 || anio > 2026) {
        errores.push('El año debe estar entre 1000 y 2026');
    }
    
    if (!genero || genero.trim().length < 3) {
        errores.push('El género debe tener al menos 3 caracteres');
    }
    
    return errores;
}

// ============================================================
// EVENT LISTENERS
// ============================================================

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    await login(usuario, password);
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
});

document.getElementById('libroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const anio = document.getElementById('anio').value;
    const genero = document.getElementById('genero').value;
    const disponible = document.getElementById('disponible').checked;
    
    const errores = validarFormularioLibro(titulo, autor, anio, genero);
    
    if (errores.length > 0) {
        alert('❌ Errores de validación:\n- ' + errores.join('\n- '));
        return;
    }
    
    await crearLibro({
        titulo: titulo.trim(),
        autor: autor.trim(),
        anio_publicacion: parseInt(anio),
        genero: genero.trim(),
        disponible
    });
});

document.getElementById('recargarBtn').addEventListener('click', () => {
    cargarLibros();
});

// Búsqueda en tiempo real
let timeoutBusqueda;
document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(() => {
        cargarLibros(e.target.value);
    }, 500);
});

// Inicializar
verificarSesion();
