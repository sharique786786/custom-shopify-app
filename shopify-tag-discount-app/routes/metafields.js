// routes/metafields.js
import express from 'express';

export default function metafieldRoutes(shopify) {
  const router = express.Router();

  const METAFIELDS = [
    { key: 'discounts', type: 'json' },
    { key: 'shipping', type: 'json' }
  ];

  // GET: Load both metafields
  router.get('/define', async (req, res) => {
  try {
    const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
    session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    const client = new shopify.clients.Rest({ session });

    // Create Discount Metafield Definition
    await client.post({
      path: 'metafield_definitions',
      data: {
        metafield_definition: {
          name: 'Discount Rules',
          namespace: 'rules',
          key: 'discounts',
          type: 'json',
          owner_type: 'shop',
          visible_to_storefront_api: false
        }
      },
      type: 'application/json',
    });

    // Create Shipping Metafield Definition
    await client.post({
      path: 'metafield_definitions',
      data: {
        metafield_definition: {
          name: 'Shipping Rules',
          namespace: 'rules',
          key: 'shipping',
          type: 'json',
          owner_type: 'shop',
          visible_to_storefront_api: false
        }
      },
      type: 'application/json',
    });

    res.json({ success: true, message: 'Metafield definitions created' });

    } catch (error) {
    console.error('❌ Error creating metafield definitions:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: error?.response?.body?.errors || error.message || 'Unknown error' });
  }
});

  // POST: Save both metafields
  router.post('/', async (req, res) => {
    const { discounts, shipping } = req.body;
  
    try {
      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
      const client = new shopify.clients.Rest({ session });
  
      await client.put({
        path: 'metafields',
        data: {
          metafield: {
            namespace: 'rules',
            key: 'discounts',
            type: 'json',
            value: JSON.stringify(discounts),
            owner_resource: 'shop',
            owner_id: null,
          }
        },
        type: 'application/json',
      });
  
      await client.put({
        path: 'metafields',
        data: {
          metafield: {
            namespace: 'rules',
            key: 'shipping',
            type: 'json',
            value: JSON.stringify(shipping),
            owner_resource: 'shop',
            owner_id: null,
          }
        },
        type: 'application/json',
      });
  
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Metafield save error:', error?.response?.body || error);
      res.status(500).json({ error: 'Failed to save metafields' });
    }
  });

  return router;
}
