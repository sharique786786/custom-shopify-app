import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { MemorySessionStorage } from '@shopify/shopify-api/dist/session/storage/memory';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: new MemorySessionStorage(),
});
