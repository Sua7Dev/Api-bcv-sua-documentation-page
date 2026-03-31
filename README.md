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
- **Planes Flexibles**: Desde acceso gratuito hasta licencias permanentes con soporte prioritario.

## 💳 Planes y Precios

| Plan | Duración | Costo | Beneficios |
| :--- | :--- | :--- | :--- |
| **Mensual** | 1 Mes | Gratis | Acceso a los endpoints (Prueba) |
| **Anual** | 1 Año | 6$ | Acceso a los endpoints + Soporte prioritario |
| **Permanente** | Vitalicio | 20$ | **Acceso ilimitado** + Actualizaciones de por vida |

> [!TIP]
> Para adquirir cualquier plan o solicitar información personalizada, puedes contactarnos vía WhatsApp: [Click aquí](https://wa.link/byrrh3)


## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS.
- **Backend (Serverless)**:## Ejecución Local con Bun

Para ejecutar este proyecto localmente, asegúrate de tener instalado [Bun](https://bun.sh/).

```bash
# Instalar dependencias
bun install

# Iniciar el servidor (ahora con soporte para API Endpoints y Entorno de Desarrollo)
bun run bun-server.js
```

El servidor estará disponible en `http://localhost:3000`.

### Endpoints Disponibles
- `/api/config`: Entrega la API Key al frontend.
- `/api/proxy`: Reenvía peticiones a la API real evitando CORS.
- `/api/auth/github`: Inicia el flujo de autenticación Social Login.
- `/api/auth/github/callback`: Maneja el retorno de GitHub y genera el token de sesión.
- `/api/generate-key`: Genera una nueva API Key vinculada al usuario (requiere autenticación).

---

tech/) (SQLite distribuido).
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
- `style.css`: Sistema de diseño global y animaciones.

## 📖 Ejemplo de Integración (Dart Console)

Estructura modular recomendada para una aplicación de consola:

### 1. `lib/mian.dart` (Lógica de API)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:dotenv/dotenv.dart';

Future<void> getRates(DotEnv env) async {
  final apiKey = env['API_KEY'] ?? '';
  final res = await http.get(
    Uri.parse('https://api-bcv-sua.vercel.app/v1/usd'),
    headers: {'x-api-key': apiKey},
  );

  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    if (data is List && data.isNotEmpty) {
      print('Tasa oficial: \$${data[0]["valor"]}');
    }
  }
}
```

### 2. `bin/mian.dart` (Entry Point)
```dart
import 'package:dotenv/dotenv.dart';
import 'package:main/mian.dart';

final env = DotEnv()..load();

Future<void> main() async {
  await getRates(env);
}
```

### 3. `pubspec.yaml`
```yaml
dependencies:
  dotenv: ^4.2.0
  http: ^1.6.0
  path: ^1.9.0
```

### Comandos
```bash
flutter pub get  # Instalar dependencias
dart run         # Ejecutar script
```

## Registro de Cambios (Timeline)

- **v1.7.0 (Marzo 31, 2026)**: Reestructuración de la documentación de Dart. Ejemplo migrado a **Console Application** con soporte para `dotenv`, múltiples archivos y comandos de ejecución detallados.
- **v1.6.5 (Marzo 31, 2026)**: Arreglo definitivo de alineación global para PC y Mobile. Se forzó la expansión total de los elementos de endpoint para una interfaz uniforme y profesional. Limpieza de parámetros de caché en HTML.
- **v1.6.4 (Marzo 31, 2026)**: Unificación global de anchos para los elementos de endpoint (PC y Móvil), garantizando una estética "bloqueada" y profesional en todas las resoluciones.
- **v1.6.2 (Marzo 31, 2026)**: Corrección de desbordamiento de JSON en los tests de la documentación para dispositivos móviles.
- **v1.6.1 (Marzo 31, 2026)**: Mejora crítica de responsividad en la lista de endpoints de la landing page (layout apilado en móvil) e integración de Tailwind CSS via CDN.
- **v1.6 (Marzo 30, 2026)**: Implementación de sección de Precios y soporte vía WhatsApp, destacando el plan "Permanente" con acceso ilimitado.
- **v1.5 (Marzo 28-29, 2026)**: Nuevos endpoints (`/v1/...-par`, `/v1/...-all`), corrección de lógica de fin de semana, limpieza de endpoints deprecados y optimización móvil integral.

- **v1.4 (Marzo 26, 2026)**: Lógica de persistencia diaria hasta medianoche, arreglos en workflows de cron y funciones edge.
- **v1.3 (Marzo 21, 2026)**: Migración de base de datos a Turso (LibSQL) y corrección de actualización de montos.
- **v1.2 (Marzo 14, 2026)**: Agregado `valorAnterior` y `fechaAnterior`, normalización de nombres y validación de API-KEYS.
- **v1.1 (Marzo 10, 2026)**: Despliegue oficial en Vercel, implementación de API-KEYS y rate limiting.
- **v1.0 (Marzo 9, 2026)**: Inicio del proyecto en EsJS, migración a Javascript puro y Bun runtime.
- Mejora de contraste en textos primarios y secundarios.
### v1.3.1 (2026-03-14): Solución de problemas críticos de UI y responsividad.
- **Floating Auth**: Rediseño del botón de login como un chip flotante en la esquina superior derecha.
- **Responsividad Crítica**: Mejoras en media queries para PC, Laptop, Tablet y Móvil.
- **UX en Documentación**: Añadida sección de "Endpoints" y mejoras de contraste en botones de GitHub.

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
