// shopify.js
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import dotenv from 'dotenv';

dotenv.config();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/https?:\/\//, ''), // e.g. "custom-shopify-app.onrender.com"
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: new (await import('@shopify/shopify-api')).MemorySessionStorage(), // or use a DB-backed store
});

export default shopify;
