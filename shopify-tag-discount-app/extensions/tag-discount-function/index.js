export default {
  async function discount(cart, input, metafield) {
    const discounts = JSON.parse(metafield?.value || '[]');
    const customerTags = cart?.buyerIdentity?.customer?.tags || [];

    const discountResults = [];

    for (const line of cart.lines) {
      for (const rule of discounts) {
        if (customerTags.includes(rule.tag)) {
          if (rule.type === 'percentage') {
            discountResults.push({
              targets: [{ productVariant: { id: line.merchandise.id } }],
              value: { percentage: { value: rule.value } },
              message: `${rule.tag} Discount`,
            });
          }
        }
      }
    }

    return {
      discounts: discountResults,
    };
  },
};