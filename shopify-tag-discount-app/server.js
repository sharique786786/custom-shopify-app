import '@shopify/shopify-api/adapters/node';
import express from 'express';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // ✅ New
import discountRoutes from './routes/discount.js';
import shippingRoutes from './routes/shipping.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser()); // ✅ Use cookie parser

// Shopify API setup
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

// ✅ Top-level redirection endpoint
app.get('/auth/toplevel', (req, res) => {
  const { shop } = req.query;

  if (!shop) return res.status(400).send('Missing shop parameter ❌');

  res.set('Content-Type', 'text/html');
  return res.send(`
    <script>
      window.top.location.href = "/auth?shop=${shop}";
    </script>
  `);
});

// ✅ OAuth entry point, handles top-level redirect cookie
app.get('/auth', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop parameter ❌');

  if (req.cookies?.shopifyTopLevelOAuth !== '1') {
    res.cookie('shopifyTopLevelOAuth', '1', { httpOnly: false });
    return res.redirect(`/auth/toplevel?shop=${shop}`);
  }

  const redirectUri = `${process.env.SHOPIFY_APP_HOST}/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${process.env.SHOPIFY_SCOPES}` +
    `&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

// ✅ OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;
  if (!shop || !code) return res.status(400).send('Missing shop or code ❌');

  try {
    const result = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    const data = await result.json();
    console.log('✅ Access token:', data.access_token);

    // Normally you'd save the token here in DB or session
    res.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_APP_HANDLE || 'your-app-handle'}`);
  } catch (err) {
    console.error('Error exchanging token:', err);
    res.status(500).send('Failed to install app ❌');
  }
});

// Your API Routes
app.use('/api/discount', discountRoutes(shopify));
app.use('/api/shipping', shippingRoutes(shopify));

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
