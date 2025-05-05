import { shopifyApi, session } from '@shopify/shopify-api';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(','),
  hostName: process.env.HOST.replace(/^https:\/\//, ''),
  isEmbeddedApp: true,
  apiVersion: '2024-01',
  sessionStorage: new session.MemorySessionStorage(), // ✅ Correct usage
});
