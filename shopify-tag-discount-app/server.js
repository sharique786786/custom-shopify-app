import '@shopify/shopify-api/adapters/node';
import express from 'express';
import dotenv from 'dotenv';
import { shopifyApp } from '@shopify/shopify-app-express';
import { LATEST_API_VERSION } from '@shopify/shopify-api';

import discountRoutes from './routes/discount.js';
import shippingRoutes from './routes/shipping.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  appUrl: process.env.SHOPIFY_APP_HOST,
});

app.use(express.json());

// Adds `/auth` and `/auth/callback` routes
app.use(shopify);

// Your logic routes
app.use('/api/discount', discountRoutes(shopify));
app.use('/api/shipping', shippingRoutes(shopify));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
