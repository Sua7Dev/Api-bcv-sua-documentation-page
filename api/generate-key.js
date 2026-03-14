import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const dbUrl = process.env.VITE_DATABASE_URL;
  const dbToken = process.env.VITE_DATABASE_AUTH_TOKEN;

  if (!dbUrl || !dbToken) {
    return res.status(500).json({ error: 'Database credentials not configured on server' });
  }

  try {
    const db = createClient({
      url: dbUrl,
      authToken: dbToken,
    });

    const generateKeyString = (length = 32) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$&';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newKey = generateKeyString(32);
    const name = `Web User ${new Date().toLocaleDateString()}`;
    
    // Expiración: 30 días (1 mes)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.execute({
      sql: 'INSERT INTO api_keys (name, key, expires_at) VALUES (?, ?, ?)',
      args: [name, newKey, expiresAt.toISOString()]
    });

    res.status(200).json({ key: newKey });
  } catch (error) {
    console.error('Error generating key:', error);
    res.status(500).json({ error: 'Failed to generate key', details: error.message });
  }
}
