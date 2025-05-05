import '@shopify/shopify-api/adapters/node';
import express from 'express';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import dotenv from 'dotenv';
import discountRoutes from './routes/discount.js';
import shippingRoutes from './routes/shipping.js';

dotenv.config();

const app = express();
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
  res.send('Custom Shopify app is live ✅');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
