import express from 'express';
import dotenv from 'dotenv';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { MemorySessionStorage } from '@shopify/shopify-api/session'; // ✅ Correct import path

dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES?.split(',') || [],
  hostName: process.env.SHOPIFY_APP_HOST?.replace(/^https?:\/\//, ''),
  isEmbeddedApp: true,
  apiVersion: LATEST_API_VERSION,
  sessionStorage: new MemorySessionStorage(),
});

const app = express();

// Simple health check route
app.get('/', (req, res) => {
  res.status(200).send('Shopify custom app is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
