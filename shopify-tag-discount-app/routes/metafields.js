import express from 'express';

export default function metafieldRoutes(shopify) {
  const router = express.Router();

  const namespace = 'tag_based_discount';
  const key = 'rules';

  router.get('/', async (req, res) => {
    try {
      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      const client = new shopify.clients.Rest({ session });
      const response = await client.get({
        path: 'metafields',
        query: {
          namespace,
          key,
          owner_resource: 'shop',
        },
      });

      const rules = response.body.metafields?.[0]?.value || '[]';
      res.json(JSON.parse(rules));
    } catch (error) {
      console.error('Fetch metafield failed:', error);
      res.status(500).send('Failed to get rules');
    }
  });

  router.post('/', async (req, res) => {
    try {
      const rules = req.body.rules || [];

      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      const client = new shopify.clients.Rest({ session });

      // Delete old rule (optional, based on use case)
      await client.delete({ path: `metafields/${namespace}.${key}` }).catch(() => {});

      const response = await client.post({
        path: 'metafields',
        data: {
          metafield: {
            namespace,
            key,
            type: 'json',
            value: JSON.stringify(rules),
            owner_resource: 'shop',
            owner_id: null,
          },
        },
        type: 'application/json',
      });

      res.json({ success: true, metafield: response.body.metafield });
    } catch (error) {
      console.error('Save metafield failed:', error);
      res.status(500).send('Failed to save rules');
    }
  });

  return router;
}

