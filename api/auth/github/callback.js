import { createClient } from '@libsql/client';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'OAuth code missing' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev'; // Should be in env

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: 'Failed to obtain access token from GitHub', details: tokenData });
    }

    // 2. Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const userData = await userResponse.json();
    const { id: github_id, login: name, avatar_url } = userData;

    // 3. Save/Update user in Turso
    const db = createClient({
      url: process.env.VITE_DATABASE_URL,
      authToken: process.env.VITE_DATABASE_AUTH_TOKEN,
    });

    await db.execute({
      sql: 'INSERT INTO users (github_id, name, avatar_url) VALUES (?, ?, ?) ON CONFLICT(github_id) DO UPDATE SET name = excluded.name, avatar_url = excluded.avatar_url',
      args: [github_id, name, avatar_url],
    });

    // 4. Generate session token
    const sessionToken = jwt.sign(
      { github_id, name, avatar_url },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 5. Redirect back to destination
    // Assuming we want to redirect to /docs.html or the referring page
    // The requirement says "redirect to origin URL (Landing or Documentation) attaching a session token"
    const redirectUrl = new URL(req.headers.origin || 'https://api-bcv-sua-documentation-page.vercel.app');
    redirectUrl.pathname = '/docs'; // Defaulting to docs for testing
    redirectUrl.searchParams.set('token', sessionToken);

    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
}
