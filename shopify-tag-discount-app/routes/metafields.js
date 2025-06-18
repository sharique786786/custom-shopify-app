// routes/metafields.js
import express from 'express';

export default function metafieldRoutes(shopify) {
  const router = express.Router();

  const METAFIELDS = [
    { key: 'discounts', type: 'json' },
    { key: 'shipping', type: 'json' }
  ];

  // GET: Load both metafields
  router.get('/', async (req, res) => {
    try {
      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      const client = new shopify.clients.Rest({ session });

      const results = await Promise.all(METAFIELDS.map(m =>
        client.get({
          path: 'metafields',
          query: { namespace: 'rules', key: m.key }
        })
      ));

      const data = {};
      METAFIELDS.forEach((m, i) => {
        const metafield = results[i].body.metafields[0];
        data[m.key] = metafield ? JSON.parse(metafield.value) : null;
      });

      res.json(data);
    } catch (err) {
      console.error('Error loading metafields:', err);
      res.status(500).send('Failed to load metafields');
    }
  });

  // POST: Save both metafields
  router.post('/', async (req, res) => {
    console.log('🔍 Incoming metafields payload:', req.body); // add this first
  
    const { discounts, shipping } = req.body;
  
    if (!discounts || !shipping) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'Missing discounts or shipping' });
    }
  
    try {
      const metafields = [
        {
          namespace: 'rules',
          key: 'discounts',
          type: 'json',
          value: JSON.stringify(discounts),
        },
        {
          namespace: 'rules',
          key: 'shipping',
          type: 'json',
          value: JSON.stringify(shipping),
        }
      ];
  
      const client = new shopify.api.clients.Rest({ session: res.locals.shopify.session });
  
      const responses = await Promise.all(
        metafields.map((mf) =>
          client.post({
            path: 'metafields',
            data: { metafield: mf },
            type: 'application/json',
          })
        )
      );
  
      res.status(200).json({ success: true, responses });
    } catch (err) {
      console.error('❌ Error saving metafields:', err);
      res.status(500).json({ error: 'Failed to save metafields' });
    }
  });


  // ✅ NEW ROUTE: Define metafield definitions
  router.post('/define', async (req, res) => {
    try {
      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      const client = new shopify.clients.Rest({ session });

      // Create Discount Rules metafield definition
      await client.post({
        path: 'metafield_definitions',
        data: {
          metafield_definition: {
            name: 'Discount Rules',
            namespace: 'rules',
            key: 'discounts',
            type: 'json',
            owner_type: 'shop'
          }
        },
        type: 'application/json'
      });

      // Create Shipping Rules metafield definition
      await client.post({
        path: 'metafield_definitions',
        data: {
          metafield_definition: {
            name: 'Shipping Rules',
            namespace: 'rules',
            key: 'shipping',
            type: 'json',
            owner_type: 'shop'
          }
        },
        type: 'application/json'
      });

      res.json({ success: true });
    } catch (err) {
      console.error('Error defining metafields:', err);
      res.status(500).json({ error: 'Failed to create metafield definitions' });
    }
  });

  return router;
}
