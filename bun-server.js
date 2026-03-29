// Servidor avanzado para Bun con soporte para API Endpoints y Archivos Estáticos
import { serve } from "bun";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

// Polyfill para evitar el error de undefined .DEV
if (typeof globalThis.process === 'undefined') {
    globalThis.process = { env: { ...process.env, DEV: true } };
} else {
    process.env.DEV = process.env.DEV || "true";
}

console.log("🛠️  Entorno de desarrollo:", process.env.DEV);

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // --- Manejo de Endpoints de API (/api/*) ---
    if (path.startsWith("/api/")) {
        try {
            // Intentar cargar el archivo del endpoint
            // Ej: /api/config -> ./api/config.js
            let handlerPath = `.${path}`;
            if (!handlerPath.endsWith(".js")) handlerPath += ".js";
            
            const module = await import(handlerPath);
            const handler = module.default;

            if (typeof handler !== "function") {
                return new Response(JSON.stringify({ error: "Handler no encontrado o inválido" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // --- Adaptador Vercel (req, res) -> Bun Response ---
            let status = 200;
            let headers = new Headers({ "Content-Type": "application/json" });
            let responseBody = "";

            const mockRes = {
                status(code) { status = code; return this; },
                setHeader(name, value) { headers.set(name, value); return this; },
                json(data) { responseBody = JSON.stringify(data); return this; },
                send(data) { 
                    responseBody = typeof data === "string" ? data : JSON.stringify(data); 
                    return this; 
                },
                redirect(url) {
                    status = 302;
                    headers.set("Location", url);
                    return this;
                }
            };

            // Mock de req con query params básicos
            const mockReq = {
                method: req.method,
                headers: Object.fromEntries(req.headers),
                query: Object.fromEntries(url.searchParams),
                body: req.body ? await req.text() : null, // Simplificado
                url: req.url
            };

            // Ejecutar el handler
            await handler(mockReq, mockRes);

            return new Response(responseBody, {
                status,
                headers
            });

        } catch (error) {
            console.error(`❌ Error en endpoint ${path}:`, error);
            return new Response(JSON.stringify({ 
                error: "Error interno en el servidor", 
                details: error.message 
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // --- Manejo de Archivos Estáticos ---
    let filePath = path === "/" ? "/index.html" : path;
    const file = Bun.file(`.${filePath}`);
    
    if (await file.exists()) {
        return new Response(file);
    }

    // Intento con extensión .html automática
    const htmlFile = Bun.file(`.${filePath}.html`);
    if (await htmlFile.exists()) {
        return new Response(htmlFile);
    }

    return new Response("404 Not Found", { status: 404 });
  },
});

console.log(`\n🚀 Servidor de documentación SUA listo en http://localhost:${PORT}`);
console.log(`Presiona Ctrl+C para detener.\n`);

