export default function handler(req, res) {
  // Solo devolvemos la clave de API pública
  res.status(200).json({
    VITE_API_KEY: process.env.VITE_API_KEY || ''
  });
}
