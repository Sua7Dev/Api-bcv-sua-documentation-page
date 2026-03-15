# API SUA-BCV | Documentation & Landing Page

La solución definitiva para obtener tasas de cambio oficiales del Banco Central de Venezuela (BCV) y Paralelo, optimizada para un alto rendimiento y facilidad de integración.

![Status](https://img.shields.io/badge/Status-Online-brightgreen)
![Runtime](https://img.shields.io/badge/Runtime-Bun-black)
![Deploy](https://img.shields.io/badge/Deploy-Vercel_Edge-blue)
![Database](https://img.shields.io/badge/Database-Turso-00d0ff)

## 🚀 Características Principales

- **Datos en Tiempo Real**: Sincronización constante con las tasas oficiales del BCV.
- **Ultra Latencia**: Ejecutado sobre **Bun** y desplegado en el **Vercel Edge** para respuestas en milisegundos.
- **Seguridad Avanzada**: Sistema de autenticación con GitHub y gestión de API Keys con vencimiento.
- **Documentación Interactiva**: Prueba los endpoints directamente desde el navegador en múltiples lenguajes (JS, Dart, Python).
- **Estética Premium**: Diseño moderno con modo oscuro, efectos de glassmorfismo y animaciones fluidas.

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS.
- **Backend (Serverless)**: Vercel Edge Functions (Edge Runtime).
- **Runtime**: [Bun](https://bun.sh/).
- **Base de Datos**: [Turso](https://turso.tech/) (SQLite distribuido).
- **Autenticación**: GitHub OAuth 2.0 + JWT.

## 🔐 Autenticación y API Keys

Para garantizar la estabilidad del servicio, la generación de API Keys requiere autenticación:

1. **GitHub Login**: Inicia sesión de forma segura usando tu cuenta de GitHub.
2. **Generación de Claves**: Genera una `x-api-key` única vinculada a tu perfil.
3. **Gestión**: Visualiza tus claves activas y su estado de vencimiento (1 mes por clave).

## 📂 Estructura del Proyecto

- `/api`: Funciones Serverless para Vercel (Auth, Proxy, Config, Key Generation).
- `index.html`: Landing page principal con resumen de características.
- `docs.html`: Documentación técnica e interfaz de pruebas.
- `style.css`: Sistema de diseño global y animaciones.
- `docs.js`: Lógica de la documentación y gestión de estado de sesión.

## 📝 Changelog

### v1.4.0 (2026-03-14): Pulido final de responsividad y diseño.
- Implementación de tipografía fluida (`clamp`) para el hero section.
- Corrección de desbordamiento horizontal en dispositivos móviles de 6.6".
- Centrado y optimización de la documentación para monitores de 24" y resoluciones ultra-wide.
- Reposicionamiento del menú móvil para evitar solapamientos.
- Mejora de contraste en textos primarios y secundarios.
### v1.3.1 (2026-03-14): Solución de problemas críticos de UI y responsividad.
- **Floating Auth**: Rediseño del botón de login como un chip flotante en la esquina superior derecha.
- **Responsividad Crítica**: Mejoras en media queries para PC, Laptop, Tablet y Móvil.
- **UX en Documentación**: Añadida sección de "Endpoints" y mejoras de contraste en botones de GitHub.
- **Side Menu**: Transformación del sidebar en un menú lateral (drawer) para dispositivos móviles.

### v1.3.0 (Marzo 2026) - El Update de Seguridad
- **Sistema de Autenticación**: Integración completa de GitHub OAuth.
- **Base de Datos**: Migración a Turso para gestión de usuarios y API Keys persistentes.
- **Sesión Global**: Persistencia de sesión (JWT) accesible tanto en la landing como en la documentación.
- **Seguridad**: Actualización masiva de `.gitignore` y cifrado de API Keys vinculadas a usuarios.
- **UI de Perfil**: Añadido avatar y nombre de usuario en la barra de navegación y sidebar.

### v1.2.0
- **Proxy para CORS**: Implementación de `/api/proxy` para permitir pruebas de API desde el navegador sin bloqueos CORS.
- **Mejora de UX**: Respuestas de la API ahora se muestran con resaltado de sintaxis y opción de copiado.
- **Optimización de Assets**: Reducción del tamaño de scripts y mejora de carga de fuentes Google Fonts.

### v1.1.0
- **Documentación Multilenguaje**: Secciones de código para Dart y Python añadidas.
- **Modo Oscuro**: Implementación del esquema de colores "Night City".

## 🛠️ Configuración (Para Desarrolladores)

Si deseas desplegar tu propia instancia:

1. Clona el repo.
2. Configura las variables de entorno en Vercel:
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: Desde GitHub Developer Settings.
   - `JWT_SECRET`: Una cadena aleatoria para firmar sesiones.
   - `VITE_DATABASE_URL` / `VITE_DATABASE_AUTH_TOKEN`: Credenciales de Turso.
   - `VITE_API_KEY`: Clave maestra de la API.

---
Hecho con ❤️ por el equipo de **SUA-BCV**.
