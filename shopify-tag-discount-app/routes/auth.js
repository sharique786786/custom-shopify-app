// auth.js
import express from 'express';
import shopify from '../shopify.js'; // make sure this file exports your shopify object

const router = express.Router();

/**
 * Step 1: Start Auth
 * GET /auth?shop={shop}.myshopify.com
 */
router.get('/auth', async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).send('Missing "shop" query parameter ❌');
  }

  try {
    const redirectUrl = await shopify.auth.beginAuth(
      req,
      res,
      shop,
      '/auth/callback', // relative to your app host, must match allowed redirect in Shopify Partner dashboard
      true
    );
    return res.redirect(redirectUrl);
  } catch (e) {
    console.error('Error during beginAuth:', e);
    return res.status(500).send('Failed to begin authentication');
  }
});

/**
 * Step 2: Callback
 * GET /auth/callback
 */
router.get('/auth/callback', async (req, res) => {
  try {
    const session = await shopify.auth.validateAuthCallback(
      req,
      res,
      req.query
    );

    // Optional: Store the session somewhere for later (e.g., DB)
    console.log('✅ App installed successfully for shop:', session.shop);

    // Redirect to your app dashboard or landing page
    return res.redirect(`/?shop=${session.shop}`);
  } catch (e) {
    console.error('Auth Callback Error:', e);
    return res.status(500).send('Authentication failed');
  }
});

export default router;
