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
import shopify from './shopify.js'; // ✅ this is the correct place to set up Shopify

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve frontend admin UI
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/admin', express.static(path.join(__dirname, 'frontend')));

// Routes
app.use('/', authRoutes);
app.use('/api/metafields', metafieldRoutes(shopify));
app.use('/api/discount', discountRoutes(shopify));
app.use('/api/shipping', shippingRoutes(shopify));

// OAuth fallback (only if you're not using Shopify's official `authRoutes`)
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

    res.send('✅ App installed successfully!');
  } catch (err) {
    console.error('Error exchanging token:', err);
    res.status(500).send('Failed to install app ❌');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
