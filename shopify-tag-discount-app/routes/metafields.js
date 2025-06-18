// routes/metafields.js
import express from 'express';

export default function (shopify) {
  const router = express.Router();

  // GET - load metafield
  router.get('/', async (req, res) => {
    const { shop } = req.query;

    try {
      const session = await shopify.api.session.customAppSession(shop);
      const metafields = await shopify.api.rest.Metafield.all({
        session,
        namespace: 'discounts',
        key: 'rules',
      });

      res.json({ metafield: metafields[0]?.value || null });
    } catch (e) {
      console.error('Error loading metafield', e);
      res.status(500).json({ error: 'Failed to load metafield' });
    }
  });

  // POST - save metafield
  router.post('/', async (req, res) => {
    const { shop } = req.query;
    const { value } = req.body;

    try {
      const session = await shopify.api.session.customAppSession(shop);

      const metafield = new shopify.api.rest.Metafield({ session });
      metafield.namespace = 'discounts';
      metafield.key = 'rules';
      metafield.type = 'json';
      metafield.value = JSON.stringify(value);

      await metafield.save();

      res.json({ success: true });
    } catch (e) {
      console.error('Error saving metafield', e);
      res.status(500).json({ error: 'Failed to save metafield' });
    }
  });

  return router;
}
