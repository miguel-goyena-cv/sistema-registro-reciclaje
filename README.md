# Sistema de Registro de Reciclaje

Sistema web simple para registrar elementos electrónicos recolectados en jornadas de reciclaje. Diseñado para uso con tablets y visualización en tiempo real.

## Características

- **Interfaz táctil optimizada para tablets** con botones grandes y fáciles de usar
- **Registro rápido** de elementos (cables, transformadores, routers, switches, ratones, otros)
- **2-3 usuarios simultáneos** pueden registrar datos desde diferentes tablets
- **Dashboard en tiempo real** con gráficas actualizadas automáticamente
- **Persistencia de datos** en base de datos SQLite
- **Datos de ejemplo** precargados para pruebas inmediatas

## Requisitos

- Python 3.7 o superior
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a red local (para usar múltiples tablets)

## Instalación

### 1. Clonar o descargar el proyecto

Descarga esta carpeta completa en tu computadora.

### 2. Crear entorno virtual (recomendado)

Abre una terminal/consola en la carpeta del proyecto y ejecuta:

```bash
python -m venv venv
```

### 3. Activar el entorno virtual

**En Windows:**
```bash
venv\Scripts\activate
```

**En Linux/Mac:**
```bash
source venv/bin/activate
```

Verás `(venv)` al inicio de la línea de comandos cuando esté activado.

### 4. Instalar dependencias

```bash
pip install -r requirements.txt
```

Esto instalará Flask, la única dependencia externa necesaria.

## Ejecución

### 1. Activar el entorno virtual

Si aún no está activado, actívalo como se indicó arriba.

### 2. Ejecutar la aplicación

```bash
python app.py
```

Verás un mensaje similar a:

```
Inicializando base de datos...
Base de datos vacía. Insertando datos de ejemplo...
Se insertaron 28 registros de ejemplo.
Base de datos lista.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.X:5000
```

### 3. Acceder a la aplicación

#### Desde la misma computadora:
- Abre tu navegador y ve a: `http://127.0.0.1:5000`

#### Desde tablets/otros dispositivos en la misma red:
1. Anota la dirección IP que aparece en la consola (ej: `192.168.1.X`)
2. En cada tablet, abre el navegador y ve a: `http://192.168.1.X:5000`

**Importante:** Asegúrate de que el firewall de Windows permita conexiones en el puerto 5000.

## Configuración del Firewall (Windows)

Si las tablets no pueden conectarse, configura el firewall:

1. Abre "Panel de Control" → "Sistema y Seguridad" → "Firewall de Windows Defender"
2. Haz clic en "Configuración avanzada"
3. Selecciona "Reglas de entrada" → "Nueva regla"
4. Tipo: "Puerto" → Siguiente
5. Puerto local específico: `5000` → Siguiente
6. Permitir la conexión → Siguiente
7. Aplicar a todos los perfiles → Siguiente
8. Nombre: "Flask Reciclaje" → Finalizar

## Uso de la Aplicación

### Pantalla de Registro (Tablets)

**URL:** `http://[IP-servidor]:5000/`

**Flujo de trabajo:**

1. **Seleccionar tipo de elemento** tocando uno de los 6 botones grandes
2. **Ajustar cantidad** usando los botones `+` y `-` (por defecto: 1)
3. **Tocar "REGISTRAR"**
4. **Flash verde** confirma el registro
5. **Auto-reset** automático, listo para siguiente entrada

**Características:**
- Botones grandes optimizados para dedos
- Mini-resumen en tiempo real del día actual
- Actualización automática cada 10 segundos
- Feedback visual inmediato

### Dashboard de Gráficas

**URL:** `http://[IP-servidor]:5000/dashboard`

**Gráficas disponibles:**

1. **Gráfica de Barras:** Total acumulado por tipo de elemento
2. **Gráfica de Línea:** Evolución temporal de la recolección

**Características:**
- Actualización automática cada 5 segundos
- Colores distintivos por tipo de elemento
- Diseño grande para visualización a distancia
- Puede proyectarse en pantalla grande o TV

## Estructura del Proyecto

```
ClaudeCode/
├── app.py                       # Aplicación Flask principal
├── database.py                  # Funciones de base de datos
├── requirements.txt             # Dependencias Python
├── README.md                    # Este archivo
├── static/
│   ├── css/
│   │   ├── style.css           # Estilos base
│   │   └── tablet.css          # Estilos para tablets (botones grandes)
│   └── js/
│       ├── registro.js         # Lógica de interfaz de registro
│       └── charts.js           # Lógica de gráficas
├── templates/
│   ├── base.html               # Plantilla base HTML
│   ├── index.html              # Pantalla de registro
│   └── dashboard.html          # Pantalla de gráficas
└── instance/
    └── reciclaje.db            # Base de datos SQLite (auto-generada)
```

## Configuración para el Evento

### Opción 1: Registro y visualización separados (Recomendado)

**Tablets para registro (2-3 unidades):**
- Abrir: `http://[IP-servidor]:5000/`
- Modo pantalla completa (F11)
- Orientación landscape (horizontal) preferida
- Cada voluntario registra en su tablet

**Laptop/tablet para visualización:**
- Abrir: `http://[IP-servidor]:5000/dashboard`
- Proyectar en pantalla grande o TV (opcional)
- Muestra el progreso en tiempo real a participantes

### Opción 2: Todo en uno

- Abrir ambas URLs en pestañas diferentes en cada dispositivo
- Alternar entre registro y visualización según necesidad

## Datos de Ejemplo

La primera vez que ejecutes la aplicación, se crearán automáticamente 20-30 registros de ejemplo distribuidos en los últimos 7 días. Esto permite:

- Probar las gráficas inmediatamente
- Ver cómo funciona el sistema
- Practicar antes del evento real

**Para limpiar los datos de ejemplo:**

1. Detén el servidor (Ctrl+C)
2. Elimina el archivo `instance/reciclaje.db`
3. Vuelve a ejecutar `python app.py`
4. Se creará una nueva base de datos vacía (con nuevos datos de ejemplo)

## Solución de Problemas

### La aplicación no arranca

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solución:**
```bash
pip install -r requirements.txt
```

### Las tablets no se conectan

**Problema:** No encuentran la dirección IP

**Solución:**
1. Verifica que todos los dispositivos estén en la misma red Wi-Fi
2. Anota la IP correcta de la computadora servidor:
   ```bash
   ipconfig  # En Windows
   ifconfig  # En Linux/Mac
   ```
3. Busca la dirección que comienza con `192.168.` o `10.`
4. Configura el firewall como se indicó arriba

### Los datos no se guardan

**Problema:** Error de base de datos bloqueada

**Solución:**
- El sistema ya tiene retry logic para manejar esto
- Si persiste, verifica que solo haya una instancia de la aplicación corriendo

### Las gráficas no se actualizan

**Problema:** Dashboard no muestra datos nuevos

**Solución:**
1. Verifica que el navegador tenga JavaScript habilitado
2. Abre la consola del navegador (F12) y busca errores
3. Recarga la página (F5 o Ctrl+R)

## Desarrollo y Personalización

### Modificar tipos de elementos

Edita `database.py`, línea 14:

```python
TIPOS_ELEMENTOS = ['cables', 'transformadores', 'routers', 'switches', 'ratones', 'otros']
```

Agrega o modifica los tipos según tus necesidades.

### Cambiar colores de botones

Edita `static/css/tablet.css` para ajustar:
- Tamaños de botones
- Colores
- Espaciado
- Fuentes

### Modificar intervalo de actualización

**Resumen (registro):** Edita `static/js/registro.js`, línea 37:
```javascript
setInterval(cargarResumen, 10000);  // 10 segundos
```

**Gráficas (dashboard):** Edita `static/js/charts.js`, línea 31:
```javascript
setInterval(() => { ... }, 5000);  // 5 segundos
```

## Tecnologías Utilizadas

- **Backend:** Flask (Python)
- **Base de Datos:** SQLite con WAL mode
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **UI Framework:** Bootstrap 5 (vía CDN)
- **Gráficas:** Chart.js 4 (vía CDN)
- **Iconos:** Font Awesome 6 (vía CDN)

## Licencia

Este proyecto es de uso educativo para estudiantes de DAM. Puedes modificarlo y adaptarlo libremente para tus necesidades.

## Soporte

Si encuentras problemas:

1. Revisa esta documentación completa
2. Verifica la consola del navegador (F12) en busca de errores
3. Revisa la terminal donde corre el servidor Python
4. Consulta con tu profesor o compañeros

## Créditos

Desarrollado para jornada de reciclaje - Centro de Estudios DAM
Sistema diseñado para ser simple, efectivo y fácil de usar por estudiantes principiantes.

---

**¡Buena suerte con tu jornada de reciclaje!** 🌱♻️
