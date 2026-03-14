/**
 * Endpoint /api/proxy
 * Reenvía peticiones a la API real añadiendo la x-api-key del lado del servidor.
 * Esto evita problemas de CORS al mantener la petición autenticada como same-origin.
 *
 * Uso: GET /api/proxy?path=/v1/usd
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { path } = req.query;

  if (!path || !path.startsWith('/v1/')) {
    return res.status(400).json({ error: 'Parámetro "path" inválido o ausente. Ejemplo: /api/proxy?path=/v1/usd' });
  }

  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'VITE_API_KEY no configurada en el servidor',
      hint: 'Agrega VITE_API_KEY en Vercel > Project Settings > Environment Variables.'
    });
  }

  const API_BASE = 'https://api-bcv-sua.vercel.app';
  const targetUrl = `${API_BASE}${path}`;

  try {
    const apiResponse = await fetch(targetUrl, {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
    });

    const contentType = apiResponse.headers.get('content-type') || 'application/json';
    const body = await apiResponse.text();

    res.status(apiResponse.status)
      .setHeader('Content-Type', contentType)
      .send(body);

  } catch (error) {
    console.error('[proxy] Error contactando la API:', error.message);
    res.status(502).json({
      error: 'No se pudo contactar la API de BCV',
      details: error.message,
    });
  }
}
