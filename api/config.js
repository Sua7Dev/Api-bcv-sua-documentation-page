/**
 * Endpoint /api/config
 * Expone la API key al frontend de forma segura (server-side).
 * La variable VITE_API_KEY debe estar configurada en Vercel > Settings > Environment Variables.
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.VITE_API_KEY;

  if (!apiKey) {
    console.error('[config] VITE_API_KEY no está configurada en las variables de entorno del servidor.');
    return res.status(500).json({
      error: 'VITE_API_KEY no configurada',
      hint: 'Agrega VITE_API_KEY en Vercel > Project Settings > Environment Variables y redespliega.'
    });
  }

  console.info(`[config] API Key entregada al frontend (${apiKey.length} chars).`);
  return res.status(200).json({ VITE_API_KEY: apiKey });
}

