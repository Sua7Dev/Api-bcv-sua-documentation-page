// Servidor estático ultra-sencillo para Bun
import { serve } from "bun";

const PORT = 3000;

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    // Manejar ruta raíz
    if (path === "/") path = "/index.html";

    // Intentar servir el archivo
    const file = Bun.file(`.${path}`);
    
    // Si no existe, intentar con .html
    if (!file.size) {
        const htmlFile = Bun.file(`.${path}.html`);
        if (htmlFile.size) return new Response(htmlFile);
        return new Response("404 Not Found", { status: 404 });
    }

    return new Response(file);
  },
});

console.log(`\n🚀 Servidor de documentación listo en http://localhost:${PORT}`);
console.log(`Presiona Ctrl+C para detener.\n`);
