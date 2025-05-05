import { shopifyApi, MemorySessionStorage } from '@shopify/shopify-api';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/^https:\/\//, ''),
  isEmbeddedApp: true,
  apiVersion: '2024-01',
  sessionStorage: new MemorySessionStorage(), // ✅ Correct usage
});

export default shopify;
