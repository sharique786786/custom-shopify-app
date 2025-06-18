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
    const { discounts, shipping } = req.body;

    try {
      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      const client = new shopify.clients.Rest({ session });

      const metafieldsToSave = [
        {
          namespace: 'rules',
          key: 'discounts',
          type: 'json',
          value: JSON.stringify(discounts),
          owner_resource: 'shop',
          owner_id: null
        },
        {
          namespace: 'rules',
          key: 'shipping',
          type: 'json',
          value: JSON.stringify(shipping),
          owner_resource: 'shop',
          owner_id: null
        }
      ];

      const responses = await Promise.all(metafieldsToSave.map(m =>
        client.put({ path: 'metafields', data: { metafield: m }, type: 'json' })
      ));

      res.json({ success: true });
    } catch (err) {
      console.error('Error saving metafields:', err);
      res.status(500).send('Failed to save metafields');
    }
  });

  return router;
}
