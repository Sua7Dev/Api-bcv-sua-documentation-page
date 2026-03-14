# 1. Restricciones de Diseño y Estilo

Preservación Estética: Queda estrictamente prohibido alterar colores, tipografías, espaciado o la estructura visual de la Landing Page y la Vista de Documentación actual.

Enfoque en Responsividad: Las modificaciones solo están permitidas para corregir comportamientos en dispositivos móviles o tablets utilizando clases de Tailwind CSS, sin afectar el diseño en desktop.

Modificación Selectiva: Solo se pueden alterar elementos visuales si se solicita de manera explícita en el prompt. Si no hay una instrucción directa, el diseño se mantiene intocable.

Stack Tecnológico: HTML5, JavaScript (Vanilla) y Tailwind CSS.

# 2. Flujo de Autenticación (Social Login - GitHub)

El sistema debe implementar un flujo de OAuth 2.0 para gestionar el acceso y la generación de API Keys.

Configuración de Rutas
Inicio de sesión: https://api-bcv-sua-documentation-page.vercel.app/auth/github

Callback de retorno: https://api-bcv-sua-documentation-page.vercel.app/auth/github/callback

Variables de Entorno
Es obligatorio el uso de:

GITHUB_CLIENT_ID

GITHUB_CLIENT_SECRET

# 3. Integración con Base de Datos (Turso)

La persistencia de datos se realizará en Turso siguiendo esta lógica:

Requisito de API Key: El usuario debe estar autenticado obligatoriamente para generar una clave de API.

Mapeo de Datos: \* El username obtenido de GitHub debe asignarse automáticamente a la columna name en la tabla users.

Deben almacenarse: GitHub ID, Nombre (username) y URL del Avatar.

Finalización del Flujo: Tras el registro/login exitoso, el servidor debe redirigir al usuario a la URL de origen (Landing o Documentación) adjuntando un token de sesión como parámetro en la URL.

# 4. Instrucciones para la Generación de Código

Al solicitar nuevas funciones o ajustes:

Priorizar la escritura de scripts de JS que manejen la lógica de redirección y consumo de la base de datos de Turso.

Asegurar que las llamadas a la base de datos sean seguras y prevengan inyecciones SQL.

Mantener el archivo index.html y los archivos de las vistas limpios, delegando la lógica a archivos .js externos si es posible.

# 5. Usa siempre bun como runtime de javascript

# 6. diseño response

tanto para pantallas grandes de pc (24"), como pantallas de laptop (15"), como pantallas de tablet (10") y pantallas de celular (6.6").
en celulares en la vista de documentacion En esta página no debe verse, y el lado de General debe verse como un menu lateral.

# 7. Actualizacion de README.md

actualiza el archivo README.md cada vez que ocurra un cambio en el proyecto significante para documentarlo
