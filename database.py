"""
Sistema de Registro de Reciclaje
Archivo: database.py
Descripción: Funciones para gestionar la base de datos SQLite
"""

import sqlite3
import os
from datetime import datetime, timedelta
import random
import time

# Ruta a la base de datos
DB_PATH = os.path.join('instance', 'reciclaje.db')

# Tipos de elementos válidos
TIPOS_ELEMENTOS = ['cables', 'transformadores', 'routers', 'switches', 'ratones', 'otros']


def get_connection():
    """
    Obtiene una conexión a la base de datos SQLite.
    Configura WAL mode para permitir lecturas/escrituras concurrentes.
    """
    # Crear carpeta instance si no existe
    os.makedirs('instance', exist_ok=True)

    # Conectar a la base de datos
    conn = sqlite3.connect(DB_PATH, timeout=10.0)

    # Configurar para retornar filas como diccionarios
    conn.row_factory = sqlite3.Row

    # Activar WAL mode para concurrencia (2-3 usuarios simultáneos)
    conn.execute('PRAGMA journal_mode=WAL')

    return conn


def init_db():
    """
    Inicializa la base de datos: crea la tabla si no existe
    y la llena con datos de ejemplo si está vacía.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Crear tabla de registros si no existe
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Verificar si la tabla está vacía
    cursor.execute('SELECT COUNT(*) as total FROM registros')
    total = cursor.fetchone()['total']

    # Si está vacía, llenarla con datos de ejemplo
    if total == 0:
        print("Base de datos vacía. Insertando datos de ejemplo...")
        seed_data(conn)
    else:
        print(f"Base de datos ya contiene {total} registros.")

    conn.commit()
    conn.close()


def seed_data(conn):
    """
    Inserta datos de ejemplo en la base de datos.
    Crea 20-30 registros distribuidos en los últimos 7 días.
    """
    cursor = conn.cursor()

    # Distribución realista de cantidades por tipo
    distribuciones = {
        'cables': (3, 8),        # Entre 3 y 8 por registro
        'transformadores': (1, 3),  # Entre 1 y 3 por registro
        'routers': (1, 4),       # Entre 1 y 4 por registro
        'switches': (1, 3),      # Entre 1 y 3 por registro
        'ratones': (2, 6),       # Entre 2 y 6 por registro
        'otros': (1, 4)          # Entre 1 y 4 por registro
    }

    # Generar registros para los últimos 7 días
    ahora = datetime.now()

    for dias_atras in range(7):
        # Fecha para este día
        fecha = ahora - timedelta(days=dias_atras)

        # Generar entre 3 y 5 registros por día
        num_registros_dia = random.randint(3, 5)

        for _ in range(num_registros_dia):
            # Seleccionar tipo aleatorio
            tipo = random.choice(TIPOS_ELEMENTOS)

            # Cantidad aleatoria según el tipo
            min_cant, max_cant = distribuciones[tipo]
            cantidad = random.randint(min_cant, max_cant)

            # Hora aleatoria del día (entre 9:00 y 18:00)
            hora = random.randint(9, 18)
            minuto = random.randint(0, 59)
            fecha_hora = fecha.replace(hour=hora, minute=minuto, second=0, microsecond=0)

            # Insertar registro
            cursor.execute(
                'INSERT INTO registros (tipo, cantidad, fecha_hora) VALUES (?, ?, ?)',
                (tipo, cantidad, fecha_hora.strftime('%Y-%m-%d %H:%M:%S'))
            )

    print(f"Se insertaron {cursor.rowcount} registros de ejemplo.")


def insertar_registro(tipo, cantidad):
    """
    Inserta un nuevo registro en la base de datos.
    Incluye retry logic para manejar locks de SQLite (concurrencia).

    Args:
        tipo (str): Tipo de elemento (cables, transformadores, etc.)
        cantidad (int): Cantidad de elementos

    Returns:
        bool: True si se insertó correctamente, False si hubo error
    """
    # Validar tipo
    if tipo not in TIPOS_ELEMENTOS:
        print(f"Error: Tipo '{tipo}' no válido")
        return False

    # Validar cantidad
    try:
        cantidad = int(cantidad)
        if cantidad < 1 or cantidad > 999:
            print(f"Error: Cantidad {cantidad} fuera de rango (1-999)")
            return False
    except (ValueError, TypeError):
        print("Error: Cantidad debe ser un número")
        return False

    # Intentar insertar con retry logic (máximo 3 intentos)
    max_intentos = 3
    for intento in range(max_intentos):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute(
                'INSERT INTO registros (tipo, cantidad) VALUES (?, ?)',
                (tipo, cantidad)
            )

            conn.commit()
            conn.close()

            print(f"Registro insertado: {cantidad} {tipo}")
            return True

        except sqlite3.OperationalError as e:
            # Si la base de datos está bloqueada y no es el último intento
            if 'locked' in str(e).lower() and intento < max_intentos - 1:
                print(f"BD bloqueada, reintentando... (intento {intento + 1}/{max_intentos})")
                time.sleep(0.1)  # Esperar 100ms antes de reintentar
                continue
            else:
                print(f"Error al insertar registro: {e}")
                return False
        except Exception as e:
            print(f"Error inesperado: {e}")
            return False

    return False


def obtener_totales_por_tipo():
    """
    Obtiene la suma total de cada tipo de elemento.

    Returns:
        dict: Diccionario con totales por tipo, ej: {"cables": 45, "routers": 23, ...}
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT tipo, SUM(cantidad) as total
            FROM registros
            GROUP BY tipo
        ''')

        resultados = cursor.fetchall()
        conn.close()

        # Convertir a diccionario, asegurando que todos los tipos estén presentes
        totales = {tipo: 0 for tipo in TIPOS_ELEMENTOS}

        for row in resultados:
            totales[row['tipo']] = row['total']

        return totales

    except Exception as e:
        print(f"Error al obtener totales: {e}")
        return {tipo: 0 for tipo in TIPOS_ELEMENTOS}


def obtener_datos_temporales():
    """
    Obtiene datos agrupados por fecha para la gráfica temporal.

    Returns:
        dict: Diccionario con 'labels' (fechas) y 'data' (cantidades totales por fecha)
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT DATE(fecha_hora) as fecha, SUM(cantidad) as total
            FROM registros
            GROUP BY DATE(fecha_hora)
            ORDER BY fecha ASC
        ''')

        resultados = cursor.fetchall()
        conn.close()

        # Separar en labels y data para Chart.js
        labels = []
        data = []

        for row in resultados:
            # Formatear fecha en español (DD/MM)
            fecha_obj = datetime.strptime(row['fecha'], '%Y-%m-%d')
            labels.append(fecha_obj.strftime('%d/%m'))
            data.append(row['total'])

        return {
            'labels': labels,
            'data': data
        }

    except Exception as e:
        print(f"Error al obtener datos temporales: {e}")
        return {'labels': [], 'data': []}


def obtener_resumen_hoy():
    """
    Obtiene resumen de registros del día actual.
    Usado para el mini-resumen en la pantalla de registro.

    Returns:
        dict: Diccionario con 'total_hoy' y totales por tipo del día
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Obtener fecha de hoy
        hoy = datetime.now().strftime('%Y-%m-%d')

        # Total general de hoy
        cursor.execute('''
            SELECT SUM(cantidad) as total
            FROM registros
            WHERE DATE(fecha_hora) = ?
        ''', (hoy,))

        row_total = cursor.fetchone()
        total_hoy = row_total['total'] if row_total['total'] is not None else 0

        # Totales por tipo de hoy
        cursor.execute('''
            SELECT tipo, SUM(cantidad) as total
            FROM registros
            WHERE DATE(fecha_hora) = ?
            GROUP BY tipo
        ''', (hoy,))

        resultados = cursor.fetchall()
        conn.close()

        # Crear diccionario asegurando todos los tipos
        por_tipo = {tipo: 0 for tipo in TIPOS_ELEMENTOS}

        for row in resultados:
            por_tipo[row['tipo']] = row['total']

        return {
            'total_hoy': total_hoy,
            'por_tipo': por_tipo
        }

    except Exception as e:
        print(f"Error al obtener resumen de hoy: {e}")
        return {
            'total_hoy': 0,
            'por_tipo': {tipo: 0 for tipo in TIPOS_ELEMENTOS}
        }


# Inicializar BD al importar el módulo
if __name__ == "__main__":
    print("Inicializando base de datos...")
    init_db()
    print("Base de datos lista.")
