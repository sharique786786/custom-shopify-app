import express from 'express';

const SWATCH_ALLOWANCES = ['VIP20', 'DESIGN2030'];

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
      const customer = customerResponse.body.customer;

      if (!customer || !customer.tags) {
        return res.status(404).json({ error: 'Customer not found or no tags' });
      }

      // Properly split customer tags
      const customerTags = customer.tags.split(',').map(tag => tag.trim());

      // Check if all cart items are swatches
      const swatchOnly = cartItems.length > 0 && cartItems.every(item => {
        return Array.isArray(item.tags) && item.tags.includes('Swatch');
      });

      // Check if customer has allowance for free swatches
      const allowedForSwatch = customerTags.some(tag => SWATCH_ALLOWANCES.includes(tag));

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