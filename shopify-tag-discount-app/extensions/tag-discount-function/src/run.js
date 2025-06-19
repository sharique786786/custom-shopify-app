export default function run(input) {
  const discountRules = input?.shop?.metafields?.[0]?.value || [];

  const customerTags = input.cart?.buyerIdentity?.customer?.tags || [];

  const discounts = [];

  for (const rule of discountRules) {
    if (customerTags.includes(rule.tag)) {
      for (const item of input.cart.lines) {
        discounts.push({
          message: `${rule.tag} ${rule.value}% off`,
          targets: [
            {
              productVariant: {
                id: item.merchandise.id
              }
            }
          ],
          value: {
            percentage: {
              value: rule.value.toString()
            }
          }
        });
      }
    }
  }

  return {
    discounts,
    discountApplicationStrategy: "FIRST"
  };
}
