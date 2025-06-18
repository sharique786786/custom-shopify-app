// shipping.js
import express from 'express';

export default function shippingRoutes(shopify) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { customerId, cartItems } = req.body;

    if (!customerId || !Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'Missing or invalid customerId/cartItems' });
    }

    try {
      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      const client = new shopify.clients.Rest({ session });

      const customerResponse = await client.get({ path: `customers/${customerId}` });
      const customerTags = customerResponse.body.customer.tags.split(',').map(tag => tag.trim());

      // ✅ Load swatch allowances from metafield
      const metafields = await shopify.api.rest.Metafield.all({
        session,
        namespace: 'rules',
        key: 'shipping',
      });

      const swatchAllowances = metafields[0]?.value ? JSON.parse(metafields[0].value) : [];

      const swatchOnly = cartItems.length > 0 && cartItems.every(item =>
        Array.isArray(item.tags) && item.tags.includes('Swatch')
      );

      const allowedForSwatch = customerTags.some(tag => swatchAllowances.includes(tag));

      if (swatchOnly && allowedForSwatch) {
        res.json({ shippingRate: 0 }); // Free shipping
      } else {
        res.json({ shippingRate: 10 }); // Normal shipping
      }

    } catch (error) {
      console.error('Error in shipping route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
