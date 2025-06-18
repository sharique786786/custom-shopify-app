document.addEventListener('DOMContentLoaded', () => {
  const discountTextarea = document.getElementById('discounts-json');
  const shippingTextarea = document.getElementById('shipping-json');
  const saveBtn = document.getElementById('save-btn');
  const status = document.getElementById('status');

  // Load existing rules
  fetch('/api/metafields')
    .then(res => res.json())
    .then(data => {
      discountTextarea.value = JSON.stringify(data.discounts || [], null, 2);
      shippingTextarea.value = JSON.stringify(data.shipping || [], null, 2);
    })
    .catch(() => {
      status.textContent = 'Failed to load rules.';
      status.style.color = 'red';
    });

  saveBtn.addEventListener('click', () => {
    try {
      const discounts = JSON.parse(discountTextarea.value);
      const shipping = JSON.parse(shippingTextarea.value);

      axios.post('/api/metafields', { discounts, shipping })
        .then(() => {
          status.textContent = '✅ Rules saved!';
          status.style.color = 'green';
        })
        .catch(() => {
          status.textContent = '❌ Failed to save rules.';
          status.style.color = 'red';
        });
    } catch (err) {
      status.textContent = '❌ Invalid JSON format.';
      status.style.color = 'red';
    }
  });
});
