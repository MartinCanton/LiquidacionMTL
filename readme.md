# 🚌 Liquidación Chofer PAX

Aplicación web para la gestión y liquidación mensual de servicios de transporte de pasajeros (PAX). Permite registrar viajes diariamente, llevar el control de kilómetros y pasajeros, y generar un informe Excel al cierre de cada mes.

---

## ✨ Funcionalidades

- **Carga diaria de viajes** — Fecha, Hoja de Ruta Ida/Vuelta, Kilómetros, PAX Ida/Vuelta, Unidad y Observaciones
- **Contador de kilómetros en tiempo real** — Totaliza automáticamente los km del mes en curso
- **Historial por mes** — Navegación y filtrado por período
- **Previsualización del informe** — Vista previa fiel al formato de liquidación antes de exportar
- **Exportación a Excel (.xlsx)** — Genera el archivo listo para presentar al área correspondiente
- **Persistencia local** — Los datos se almacenan en el navegador (localStorage), sin necesidad de servidor
- **Respaldo de datos** — Exportación de backup en formato JSON
- **100% offline** — Funciona sin conexión a internet una vez cargada la página

---

## 🖥️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de la interfaz |
| CSS3 | Estilos y diseño responsivo |
| JavaScript (Vanilla) | Lógica de la aplicación |
| [SheetJS (xlsx)](https://sheetjs.com/) | Generación de archivos Excel |
| localStorage | Persistencia de datos en el navegador |

---

## 📁 Estructura del proyecto

```
liquidacion-chofer-pax/
├── index.html       # Estructura HTML y navegación
├── script.js        # Lógica de la aplicación
├── style.css        # Estilos y diseño
└── README.md        # Este archivo
```

---

## 🚀 Uso

### Opción 1 — Local

1. Clonar o descargar el repositorio
2. Abrir `index.html` directamente en cualquier navegador moderno
3. No requiere instalación ni servidor

```bash
git clone https://github.com/tu-usuario/liquidacion-chofer-pax.git
cd liquidacion-chofer-pax
# Abrir index.html en el navegador
```

### Opción 2 — Deploy (GitHub Pages, Netlify, etc.)

Al ser una aplicación estática, puede desplegarse directamente desde el repositorio sin configuración adicional.

---

## 📋 Flujo de trabajo típico

```
Cada día
   └── 📋 Cargar Viaje → completar los datos del servicio realizado

Fin de mes
   └── 📄 Informe Final → seleccionar el período
                        → previsualizar el informe
                        → descargar el Excel
                        → enviar al área correspondiente
```

---

## 📊 Datos que se registran por viaje

| Campo | Descripción |
|---|---|
| Fecha | Fecha del servicio |
| Hoja de Ruta Ida | Número de HR del trayecto de ida |
| Hoja de Ruta Vuelta | Número de HR del trayecto de vuelta |
| Kilómetros | Distancia recorrida en el servicio |
| PAX Ida | Pasajeros transportados en ida |
| PAX Vuelta | Pasajeros transportados en vuelta |
| Unidad | Vehículo utilizado |
| Observaciones | Notas adicionales del servicio |

---

## ⚙️ Configuración inicial

Antes de comenzar a cargar viajes, se recomienda completar la sección **Configuración** con:

- Nombre completo del chofer
- Legajo / N° de chofer
- Empresa / Operadora

Estos datos aparecerán automáticamente en el encabezado del informe exportado.

---

## 💾 Sobre el almacenamiento de datos

Los datos se guardan en el `localStorage` del navegador bajo la clave `liquidacion_pax_v2`.

**Consideraciones importantes:**
- Los datos son locales al navegador y dispositivo donde se carga la app
- Limpiar el caché o los datos del navegador **eliminará** toda la información
- Se recomienda usar la función **"Exportar respaldo JSON"** periódicamente como copia de seguridad
- Para migrar datos a otro dispositivo, exportar el JSON e importarlo manualmente

---

## 🗺️ Roadmap

- [ ] Autenticación de usuarios (login por chofer)
- [ ] Base de datos en la nube (sincronización entre dispositivos)
- [ ] Registro de múltiples choferes con panel de administración
- [ ] Importación de backup JSON desde la interfaz
- [ ] Modo oscuro / claro configurable
- [ ] Exportación a PDF del informe

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes, por favor abrí primero un issue para discutir qué te gustaría modificar.

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

---

> Desarrollado para simplificar la liquidación mensual de servicios de transporte de pasajeros.