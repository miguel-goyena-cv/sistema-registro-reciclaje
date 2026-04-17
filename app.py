"""
Sistema de Registro de Reciclaje
Archivo: app.py
Descripción: Aplicación Flask principal con todas las rutas
"""

from flask import Flask, render_template, request, jsonify
import database
import os

# Crear aplicación Flask
app = Flask(__name__)

# Configuración
app.config['DEBUG'] = True
app.config['JSON_AS_ASCII'] = False  # Para caracteres españoles en JSON

# Crear carpeta instance si no existe
os.makedirs('instance', exist_ok=True)

# Inicializar base de datos al arrancar la aplicación
database.init_db()


@app.route('/')
def index():
    """
    Ruta principal: Pantalla de registro optimizada para tablets.
    Muestra botones grandes para selección rápida.
    """
    return render_template('index.html')


@app.route('/dashboard')
def dashboard():
    """
    Ruta del dashboard: Pantalla de visualización con gráficas completas.
    Para mostrar en laptop/monitor/tablet aparte.
    """
    return render_template('dashboard.html')


@app.route('/registrar', methods=['POST'])
def registrar():
    """
    Ruta para registrar un nuevo elemento.
    Recibe JSON con tipo y cantidad, valida e inserta en BD.

    Formato esperado:
    {
        "tipo": "cables",
        "cantidad": 5
    }

    Retorna JSON:
    {
        "success": true/false,
        "message": "Mensaje descriptivo"
    }
    """
    try:
        # Obtener datos del request (JSON)
        datos = request.get_json()

        if not datos:
            return jsonify({
                'success': False,
                'message': 'No se recibieron datos'
            }), 400

        tipo = datos.get('tipo')
        cantidad = datos.get('cantidad')

        # Validar que los campos estén presentes
        if not tipo or cantidad is None:
            return jsonify({
                'success': False,
                'message': 'Faltan datos (tipo o cantidad)'
            }), 400

        # Validar tipo
        if tipo not in database.TIPOS_ELEMENTOS:
            return jsonify({
                'success': False,
                'message': f'Tipo "{tipo}" no válido'
            }), 400

        # Validar cantidad
        try:
            cantidad = int(cantidad)
            if cantidad < 1 or cantidad > 999:
                return jsonify({
                    'success': False,
                    'message': 'La cantidad debe estar entre 1 y 999'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'message': 'La cantidad debe ser un número'
            }), 400

        # Insertar en base de datos
        exito = database.insertar_registro(tipo, cantidad)

        if exito:
            return jsonify({
                'success': True,
                'message': f'{cantidad} {tipo} registrado correctamente'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Error al guardar en la base de datos'
            }), 500

    except Exception as e:
        print(f"Error en /registrar: {e}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500


@app.route('/datos/totales')
def datos_totales():
    """
    Retorna los totales agrupados por tipo de elemento.
    Usado para la gráfica de barras.

    Retorna JSON:
    {
        "cables": 45,
        "transformadores": 12,
        "routers": 23,
        ...
    }
    """
    try:
        totales = database.obtener_totales_por_tipo()
        return jsonify(totales)

    except Exception as e:
        print(f"Error en /datos/totales: {e}")
        return jsonify({tipo: 0 for tipo in database.TIPOS_ELEMENTOS}), 500


@app.route('/datos/temporal')
def datos_temporal():
    """
    Retorna datos agrupados por fecha para gráfica temporal.
    Usado para la gráfica de línea (evolución en el tiempo).

    Retorna JSON:
    {
        "labels": ["17/04", "18/04", "19/04", ...],
        "data": [20, 35, 18, ...]
    }
    """
    try:
        datos = database.obtener_datos_temporales()
        return jsonify(datos)

    except Exception as e:
        print(f"Error en /datos/temporal: {e}")
        return jsonify({'labels': [], 'data': []}), 500


@app.route('/datos/resumen')
def datos_resumen():
    """
    Retorna resumen de registros del día actual.
    Usado para el mini-resumen en la pantalla de registro (tablets).

    Retorna JSON:
    {
        "total_hoy": 147,
        "por_tipo": {
            "cables": 45,
            "transformadores": 12,
            ...
        }
    }
    """
    try:
        resumen = database.obtener_resumen_hoy()
        return jsonify(resumen)

    except Exception as e:
        print(f"Error en /datos/resumen: {e}")
        return jsonify({
            'total_hoy': 0,
            'por_tipo': {tipo: 0 for tipo in database.TIPOS_ELEMENTOS}
        }), 500


if __name__ == '__main__':
    # Ejecutar aplicación en modo debug
    # host='0.0.0.0' permite acceso desde otros dispositivos en la red
    app.run(host='0.0.0.0', port=5000, debug=True)
