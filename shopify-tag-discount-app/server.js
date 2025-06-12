// server.js
import '@shopify/shopify-api/adapters/node';
import express from 'express';
import authRoutes from './routes/auth.js';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import dotenv from 'dotenv';
import discountRoutes from './routes/discount.js';
import shippingRoutes from './routes/shipping.js';
import metafieldRoutes from './routes/metafields.js';
app.use('/api/metafields', metafieldRoutes(shopify));

dotenv.config();

const app = express();
app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Shopify API setup
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

// Routes
app.use('/api/discount', discountRoutes(shopify));
app.use('/api/shipping', shippingRoutes(shopify));

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
  console.log(`Server listening on http://localhost:${PORT}`);
});
