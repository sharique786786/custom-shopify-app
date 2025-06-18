router.post('/define', async (req, res) => {
    try {
      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      const client = new shopify.clients.Rest({ session });

      const metafieldsToCreate = [
        {
          namespace: "rules",
          key: "discounts",
          type: "json",
          name: "Discount Rules",
          description: "Customer tag-based discount rules",
          owner_type: "shop"
        },
        {
          namespace: "rules",
          key: "shipping",
          type: "json",
          name: "Shipping Rules",
          description: "Shipping rules for swatches",
          owner_type: "shop"
        }
      ];

      for (const metafield of metafieldsToCreate) {
        try {
          await client.post({
            path: 'metafield_definitions',
            data: { metafield_definition: metafield },
            type: 'application/json'
          });
        } catch (error) {
          if (error.response && error.response.code === 422) {
            console.warn(`⚠️ Definition already exists for ${metafield.namespace}.${metafield.key}`);
          } else {
            console.error(`❌ Error creating metafield definition for ${metafield.key}:`, error.response?.body || error.message);
            throw error;
          }
        }
      }

      res.json({ success: true });

    } catch (error) {
      console.error('❌ Unexpected error during metafield definition creation:', error);
      res.status(500).json({
        error: error?.response?.body?.errors || error.message || 'Unknown error'
      });
    }
  });
