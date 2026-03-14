import { createClient } from '@libsql/client';
import { verifySession } from './utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Verify Authentication
  const user = verifySession(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required to generate an API Key' });
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
    // Use the GitHub username as the key name as requested
    const name = user.name;
    
    // Expiración: 30 días (1 mes)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.execute({
      sql: 'INSERT INTO api_keys (name, key, expires_at, user_id) VALUES (?, ?, ?, ?)',
      args: [name, newKey, expiresAt.toISOString(), user.github_id]
    });

    res.status(200).json({ key: newKey });
  } catch (error) {
    console.error('Error generating key:', error);
    res.status(500).json({ error: 'Failed to generate key', details: error.message });
  }
}
