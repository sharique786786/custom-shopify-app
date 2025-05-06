import express from 'express';

const CUSTOMER_DISCOUNTS = [
  { tag: 'VIP20', discount: 20, message: 'Tag Based Discount- VIP -20%', type: 'flat' },
  { tag: 'DESIGN2030', discount: 30, min_spend: 250000, message: 'DESIGN -30%', type: 'min_spend' },
  { tag: 'DESIGN2030', discount: 20, min_spend: 40000, max_spend: 249999, message: 'DESIGN -20%', type: 'min_and_max' },
  { tag: 'FRIENDSANDFAMILY', discount: 20, message: 'FRIENDS AND FAMILY -20%', type: 'flat' }
];
 
export default function discountRoutes(shopify) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { customerId, cartSubtotal } = req.body;

    try {
      const session = await shopify.session.customAppSession(process.env.SHOPIFY_STORE_URL);
      session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      const client = new shopify.clients.Rest({ session });
      const customerData = await client.get({ path: `customers/${customerId}` });

      // Correctly parse customer tags to array
      const customerTags = customerData.body.customer.tags.split(',').map(tag => tag.trim());

      let selectedDiscount = null;
      let maxDiscount = 0;

      CUSTOMER_DISCOUNTS.forEach(discountRule => {
        if (customerTags.includes(discountRule.tag)) {
          let eligible = false;

          if (discountRule.type === 'flat') {
            eligible = true;
          } else if (discountRule.type === 'min_spend' && cartSubtotal >= discountRule.min_spend) {
            eligible = true;
          } else if (discountRule.type === 'min_and_max' &&
                     cartSubtotal >= discountRule.min_spend &&
                     cartSubtotal <= discountRule.max_spend) {
            eligible = true;
          }

          if (eligible && discountRule.discount > maxDiscount) {
            maxDiscount = discountRule.discount;
            selectedDiscount = discountRule;
          }
        }
      });

      if (selectedDiscount) {
        res.json({
          discountPercentage: selectedDiscount.discount,
          discountMessage: selectedDiscount.message
        });
      } else {
        res.json({ discountPercentage: 0 });
      }

    } catch (error) {
      console.error('Error in discount route:', error);
      res.status(500).send('Error checking discount');
    }
  });

  return router;
}
