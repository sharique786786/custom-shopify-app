// routes/metafields.js
export default (shopify) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { shop, namespace, key, value, type = 'json' } = req.body;

    try {
      const session = await shopify.api.session.customAppSession(shop);

      const metafield = new shopify.api.rest.Metafield({ session });
      metafield.namespace = namespace;
      metafield.key = key;
      metafield.type = type;
      metafield.value = typeof value === 'string' ? value : JSON.stringify(value);

      await metafield.save();

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Metafield save failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
