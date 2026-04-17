# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de Registro de Reciclaje: Flask application for recording electronic waste collection at school events. Optimized for tablet-based data entry with large touch-friendly buttons and real-time dashboard visualization.

**Target users:** 1st year DAM students with basic Python/Flask knowledge. Code is intentionally simple (functions only, no classes) with extensive Spanish comments.

## Running the Application

```bash
# Setup (first time only)
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Run application
python app.py
```

**IMPORTANT:** The user manually controls the Python process. Do NOT attempt to start, restart, or stop `python app.py` automatically. Flask runs with `debug=True` for auto-reload of Python files.

Access points:
- Registration interface (tablets): `http://[IP]:5000/`
- Dashboard (visualization): `http://[IP]:5000/dashboard`

## Architecture

### Two-Screen Design
1. **Registration Interface** (`/`): Tablet-optimized with large buttons for fast data entry (2-3 simultaneous users)
2. **Dashboard** (`/dashboard`): Real-time charts for visualization on separate screen

### Backend Layer (`database.py`)
- SQLite with **WAL mode** enabled for concurrent access (2-3 users)
- **Retry logic**: 3 attempts with 100ms delays to handle database locks
- Core functions:
  - `init_db()`: Creates schema and seeds 20-30 sample records
  - `insertar_registro(tipo, cantidad)`: INSERT with retry logic
  - `obtener_totales_por_tipo()`: Returns dict for bar chart
  - `obtener_datos_temporales()`: Returns labels/data for line chart
  - `obtener_resumen_hoy()`: Returns today's summary for mini-panel

### Flask Routes (`app.py`)
- `GET /`: Registration interface (tablet UI)
- `GET /dashboard`: Visualization screen (charts)
- `POST /registrar`: Accepts JSON `{"tipo": "cables", "cantidad": 5}`, returns JSON response
- `GET /datos/totales`: JSON for bar chart
- `GET /datos/temporal`: JSON for line chart
- `GET /datos/resumen`: JSON for mini-summary panel

### Frontend Structure

**Touch-Optimized UI** (`static/css/tablet.css`):
- Type selection buttons: 250x120px minimum
- +/- quantity buttons: 100x100px
- Register button: 100% width × 100px height
- Debounce: 200ms on quantity controls

**Registration Logic** (`static/js/registro.js`):
- State: `tipoSeleccionado`, `cantidad`
- Auto-reset after successful registration (<5 seconds per entry)
- Auto-refresh summary every 10 seconds
- Flash overlay confirmation

**Dashboard Logic** (`static/js/charts.js`):
- Chart.js bar chart (totals by type) with 6 distinct colors
- Chart.js line chart (temporal evolution)
- Auto-refresh both charts every 5 seconds

## Element Types

Fixed list in `database.py` line 16:
```python
TIPOS_ELEMENTOS = ['cables', 'transformadores', 'routers', 'switches', 'ratones', 'otros']
```

To add/modify element types, update this constant and matching frontend buttons in `templates/index.html`.

## Data Flow

1. User taps element type button → `tipoSeleccionado` set, register button enabled
2. User adjusts quantity with +/- → `cantidad` updated (min: 1, max: 999)
3. User taps REGISTER → AJAX POST to `/registrar`
4. Backend validates → `insertar_registro()` with retry logic
5. Success → Green flash overlay → Auto-reset form
6. Mini-summary updates immediately, dashboard refreshes within 5s

## Concurrency Strategy

- **SQLite WAL mode**: Allows multiple readers + single writer without blocking
- **Retry logic**: Handles occasional locks (3 attempts × 100ms)
- **Sufficient for**: 2-3 tablets registering simultaneously
- **Database location**: `instance/reciclaje.db` (auto-created)

## Static Files and Browser Reload

Changes to JavaScript, CSS, or HTML templates do NOT require Python restart. Users must reload browser (F5/Ctrl+R) to see changes. Flask's `debug=True` only auto-reloads Python files.

## Key Constraints

- **No classes**: All code uses functions for beginner-friendliness
- **Spanish language**: All UI text, comments, and variable names in Spanish
- **CDN-only**: Bootstrap 5, Chart.js 4, Font Awesome 6 loaded via CDN (no build tools)
- **Validation**: Both frontend (JavaScript) and backend (Flask) validate tipo and cantidad
- **Sample data**: Auto-generated on first run for immediate testing

## Database Schema

```sql
CREATE TABLE registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

To reset database: Delete `instance/reciclaje.db` and restart application.
