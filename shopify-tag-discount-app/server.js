// server.js
import '@shopify/shopify-api/adapters/node';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import discountRoutes from './routes/discount.js';
import shippingRoutes from './routes/shipping.js';
import metafieldRoutes from './routes/metafields.js';
import shopify from './shopify.js';// ✅ using the one true Shopify instance

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/api/discount', discountRoutes(shopify));
app.use('/api/shipping', shippingRoutes(shopify));
app.use('/api/metafields', metafieldRoutes(shopify));

// Serve frontend (HTML UI)
app.use('/admin', express.static(path.join(__dirname, 'frontend')));
app.get('/admin', (_, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// OAuth Start
app.get('/', (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Missing shop parameter ❌');

  const redirectUri = `${process.env.SHOPIFY_APP_HOST}/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${process.env.SHOPIFY_SCOPES}` +
    `&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

// OAuth Callback
app.get('/auth/callback', async (req, res) => {
  const { shop, code, host } = req.query;
  if (!shop || !code || !host) return res.status(400).send('Missing shop, code, or host ❌');

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

    // Redirect to your embedded app UI
    return res.redirect(
      `/admin?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}&apiKey=${process.env.SHOPIFY_API_KEY}`
    );
  } catch (err) {
    console.error('❌ Error exchanging token:', err);
    res.status(500).send('Failed to install app ❌');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
