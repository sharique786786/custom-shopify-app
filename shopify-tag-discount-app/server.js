import '@shopify/shopify-api/adapters/node';
import express from 'express';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import dotenv from 'dotenv';
import discountRoutes from './routes/discount.js';
import shippingRoutes from './routes/shipping.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());

// Shopify API setup
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: (process.env.SHOPIFY_APP_HOST || '').replace(/https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

// Routes
app.use('/api/discount', discountRoutes(shopify));
app.use('/api/shipping', shippingRoutes(shopify));

// app.get('/', (req, res) => {
//   res.send('Custom Shopify app is live ✅');
// });

app.get('/', async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.send('Missing "shop" query parameter ❌');
  }

  try {
    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: '/auth/callback',
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    return res.redirect(authRoute);
  } catch (error) {
    console.error('Error starting OAuth:', error);
    return res.status(500).send('Error starting Shopify OAuth');
  }
});

app.get('/auth/callback', async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    // You can store the session.accessToken and session.shop if needed
    console.log('OAuth session:', session);

    return res.redirect(`/?shop=${session.shop}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).send('Failed to complete OAuth process');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
