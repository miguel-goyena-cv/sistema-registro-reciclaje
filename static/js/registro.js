/**
 * Sistema de Registro de Reciclaje
 * Archivo: registro.js
 * Descripción: Lógica de la interfaz de registro para tablets
 */

// Estado del formulario
let tipoSeleccionado = null;
let cantidad = 1;

// Referencias a elementos del DOM
const botonesTipo = document.querySelectorAll('.btn-tipo');
const displayCantidad = document.getElementById('display-cantidad');
const btnIncrementar = document.getElementById('btn-incrementar');
const btnDecrementar = document.getElementById('btn-decrementar');
const btnRegistrar = document.getElementById('btn-registrar');
const mensajeFeedback = document.getElementById('mensaje-feedback');
const flashExito = document.getElementById('flash-exito');

// Constantes
const CANTIDAD_MIN = 1;
const CANTIDAD_MAX = 999;
const DEBOUNCE_DELAY = 200; // ms para prevenir doble-click

// Variables para debounce
let ultimoClick = 0;

/**
 * Inicialización al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Interfaz de registro iniciada');

    // Configurar event listeners
    configurarBotonesTipo();
    configurarControlCantidad();
    configurarBotonRegistrar();

    // Cargar resumen inicial
    cargarResumen();

    // Actualizar resumen cada 10 segundos
    setInterval(cargarResumen, 10000);
});

/**
 * Configurar botones de selección de tipo
 */
function configurarBotonesTipo() {
    botonesTipo.forEach(boton => {
        boton.addEventListener('click', () => {
            // Obtener tipo del atributo data-tipo
            const tipo = boton.getAttribute('data-tipo');

            // Si es el mismo tipo, deseleccionar
            if (tipoSeleccionado === tipo) {
                deseleccionarTipo();
            } else {
                seleccionarTipo(tipo, boton);
            }
        });
    });
}

/**
 * Seleccionar un tipo de elemento
 */
function seleccionarTipo(tipo, boton) {
    // Remover selección de todos los botones
    botonesTipo.forEach(btn => btn.classList.remove('seleccionado'));

    // Marcar como seleccionado
    boton.classList.add('seleccionado');
    tipoSeleccionado = tipo;

    // Habilitar botón de registrar
    btnRegistrar.disabled = false;

    console.log(`Tipo seleccionado: ${tipo}`);
}

/**
 * Deseleccionar tipo
 */
function deseleccionarTipo() {
    botonesTipo.forEach(btn => btn.classList.remove('seleccionado'));
    tipoSeleccionado = null;
    btnRegistrar.disabled = true;
}

/**
 * Configurar controles de cantidad (+/-)
 */
function configurarControlCantidad() {
    // Botón incrementar
    btnIncrementar.addEventListener('click', () => {
        if (!puedeClickear()) return;

        if (cantidad < CANTIDAD_MAX) {
            cantidad++;
            actualizarDisplayCantidad();
        }
    });

    // Botón decrementar
    btnDecrementar.addEventListener('click', () => {
        if (!puedeClickear()) return;

        if (cantidad > CANTIDAD_MIN) {
            cantidad--;
            actualizarDisplayCantidad();
        }
    });
}

/**
 * Prevenir doble-click (debounce)
 */
function puedeClickear() {
    const ahora = Date.now();
    if (ahora - ultimoClick < DEBOUNCE_DELAY) {
        return false;
    }
    ultimoClick = ahora;
    return true;
}

/**
 * Actualizar display de cantidad con animación
 */
function actualizarDisplayCantidad() {
    displayCantidad.textContent = cantidad;

    // Animación de pulso
    displayCantidad.classList.add('pulso');
    setTimeout(() => {
        displayCantidad.classList.remove('pulso');
    }, 300);
}

/**
 * Configurar botón de registrar
 */
function configurarBotonRegistrar() {
    btnRegistrar.addEventListener('click', async () => {
        // Validar que hay tipo seleccionado
        if (!tipoSeleccionado) {
            mostrarError('Debes seleccionar un tipo de elemento');
            // Shake animation en botones de tipo
            botonesTipo.forEach(btn => {
                btn.classList.add('shake');
                setTimeout(() => btn.classList.remove('shake'), 500);
            });
            return;
        }

        // Validar cantidad
        if (cantidad < CANTIDAD_MIN || cantidad > CANTIDAD_MAX) {
            mostrarError('Cantidad inválida');
            displayCantidad.classList.add('error');
            setTimeout(() => displayCantidad.classList.remove('error'), 1000);
            return;
        }

        // Deshabilitar botón mientras se procesa
        btnRegistrar.disabled = true;

        // Enviar registro
        const exito = await enviarRegistro(tipoSeleccionado, cantidad);

        if (exito) {
            mostrarFlashExito();
            resetearFormulario();
            await cargarResumen(); // Actualizar resumen inmediatamente
        } else {
            btnRegistrar.disabled = false;
        }
    });
}

/**
 * Enviar registro al servidor
 */
async function enviarRegistro(tipo, cantidad) {
    try {
        const response = await fetch('/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tipo, cantidad })
        });

        const resultado = await response.json();

        if (resultado.success) {
            console.log('Registro exitoso:', resultado.message);
            return true;
        } else {
            mostrarError(resultado.message);
            return false;
        }

    } catch (error) {
        console.error('Error al enviar registro:', error);
        mostrarError('Error de conexión. Intenta de nuevo.');
        return false;
    }
}

/**
 * Mostrar flash de éxito (overlay verde)
 */
function mostrarFlashExito() {
    flashExito.classList.add('show');

    // Ocultar después de 1 segundo
    setTimeout(() => {
        flashExito.classList.remove('show');
    }, 1000);
}

/**
 * Resetear formulario (auto-reset)
 */
function resetearFormulario() {
    // Resetear cantidad a 1
    cantidad = 1;
    actualizarDisplayCantidad();

    // Deseleccionar tipo
    deseleccionarTipo();

    // Limpiar mensajes
    mensajeFeedback.innerHTML = '';
    mensajeFeedback.className = '';

    console.log('Formulario reseteado - listo para siguiente registro');
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje) {
    mensajeFeedback.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i> ${mensaje}
        </div>
    `;

    // Limpiar después de 3 segundos
    setTimeout(() => {
        mensajeFeedback.innerHTML = '';
    }, 3000);
}

/**
 * Cargar resumen del día
 */
async function cargarResumen() {
    try {
        const response = await fetch('/datos/resumen');
        const datos = await response.json();

        // Actualizar total de hoy
        const totalHoyElement = document.getElementById('total-hoy');
        const totalAnterior = parseInt(totalHoyElement.textContent) || 0;
        const totalNuevo = datos.total_hoy;

        totalHoyElement.textContent = totalNuevo;

        // Animación si cambió el total
        if (totalNuevo !== totalAnterior) {
            totalHoyElement.classList.add('actualizado');
            setTimeout(() => totalHoyElement.classList.remove('actualizado'), 400);
        }

        // Actualizar desglose por tipo
        const tipos = ['cables', 'transformadores', 'routers', 'switches', 'ratones', 'otros'];

        tipos.forEach(tipo => {
            const elemento = document.getElementById(`resumen-${tipo}`);
            if (elemento) {
                const valorAnterior = parseInt(elemento.textContent) || 0;
                const valorNuevo = datos.por_tipo[tipo] || 0;

                elemento.textContent = valorNuevo;

                // Animación si cambió
                if (valorNuevo !== valorAnterior) {
                    elemento.classList.add('actualizado');
                    setTimeout(() => elemento.classList.remove('actualizado'), 400);
                }
            }
        });

        console.log('Resumen actualizado:', datos);

    } catch (error) {
        console.error('Error al cargar resumen:', error);
    }
}

/**
 * Intentar usar vibración si está disponible (feedback táctil)
 */
function vibrar(duracion = 50) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duracion);
    }
}

// Agregar vibración a botones en click (opcional)
document.querySelectorAll('.btn-tipo, .btn-cantidad, .btn-registrar').forEach(boton => {
    boton.addEventListener('click', () => vibrar(30));
});
