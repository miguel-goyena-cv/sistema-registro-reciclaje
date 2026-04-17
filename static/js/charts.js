/**
 * Sistema de Registro de Reciclaje
 * Archivo: charts.js
 * Descripción: Lógica de gráficas para el dashboard
 */

// Variables globales para las gráficas
let chartTotales = null;
let chartTemporal = null;

// Colores para cada tipo de elemento
const COLORES = {
    cables: '#FF6384',           // Rosa/Rojo
    transformadores: '#36A2EB',  // Azul
    routers: '#FFCE56',          // Amarillo
    switches: '#4BC0C0',         // Turquesa
    ratones: '#9966FF',          // Morado
    otros: '#FF9F40'             // Naranja
};

/**
 * Inicialización al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard de gráficas iniciado');

    // Cargar ambas gráficas
    cargarGraficoTotales();
    cargarGraficoTemporal();

    // Actualizar gráficas cada 5 segundos
    setInterval(() => {
        cargarGraficoTotales();
        cargarGraficoTemporal();
    }, 5000);
});

/**
 * Cargar gráfica de totales por tipo (barras)
 */
async function cargarGraficoTotales() {
    try {
        const response = await fetch('/datos/totales');
        const datos = await response.json();

        console.log('Datos totales recibidos:', datos);

        // Preparar datos para Chart.js
        const labels = [];
        const values = [];
        const backgroundColors = [];

        // Orden y nombres en español
        const tiposOrdenados = [
            { key: 'cables', label: 'Cables' },
            { key: 'transformadores', label: 'Transformadores' },
            { key: 'routers', label: 'Routers' },
            { key: 'switches', label: 'Switches' },
            { key: 'ratones', label: 'Ratones' },
            { key: 'otros', label: 'Otros' }
        ];

        tiposOrdenados.forEach(tipo => {
            labels.push(tipo.label);
            values.push(datos[tipo.key] || 0);
            backgroundColors.push(COLORES[tipo.key]);
        });

        // Obtener canvas
        const ctx = document.getElementById('chartTotales').getContext('2d');

        // Si la gráfica ya existe, actualizarla
        if (chartTotales) {
            chartTotales.data.labels = labels;
            chartTotales.data.datasets[0].data = values;
            chartTotales.update();
            return;
        }

        // Crear nueva gráfica
        chartTotales = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad Total',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace(')', ', 1)').replace('rgb', 'rgba')),
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5,
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar gráfica de totales:', error);
    }
}

/**
 * Cargar gráfica temporal (línea)
 */
async function cargarGraficoTemporal() {
    try {
        const response = await fetch('/datos/temporal');
        const datos = await response.json();

        console.log('Datos temporales recibidos:', datos);

        // Obtener canvas
        const ctx = document.getElementById('chartTemporal').getContext('2d');

        // Si la gráfica ya existe, actualizarla
        if (chartTemporal) {
            chartTemporal.data.labels = datos.labels;
            chartTemporal.data.datasets[0].data = datos.data;
            chartTemporal.update();
            return;
        }

        // Crear nueva gráfica
        chartTemporal = new Chart(ctx, {
            type: 'line',
            data: {
                labels: datos.labels,
                datasets: [{
                    label: 'Elementos Recolectados',
                    data: datos.data,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,  // Curvas suaves
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#36A2EB',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#36A2EB',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Cantidad: ${context.parsed.y} elementos`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5,
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar gráfica temporal:', error);
    }
}

/**
 * Función auxiliar para formatear fechas
 */
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
}
