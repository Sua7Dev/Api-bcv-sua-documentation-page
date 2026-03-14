/**
 * GET /api/auth/github
 * Redirects the user to GitHub OAuth authorization page.
 */
export default function handler(req, res) {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: 'GITHUB_CLIENT_ID not configured on server' });
  }

  // Define scope as 'read:user' to get profile info
  const scope = 'read:user';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scope}`;

  res.redirect(githubAuthUrl);
}
