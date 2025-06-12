import React, { useEffect, useState } from 'react';
import { Page, Layout, Card, Button, TextField, Stack } from '@shopify/polaris';

export default function Home() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metafields')
      .then(res => res.json())
      .then(setRules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, { tag: '', discount: 0, message: '', type: 'flat' }]);
  };

  const saveRules = async () => {
    const response = await fetch('/api/metafields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules }),
    });

    if (response.ok) alert('Saved!');
    else alert('Error saving');
  };

  return (
    <Page title="Tag-Based Discount Rules" fullWidth>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            {loading ? 'Loading...' : (
              <>
                {rules.map((rule, idx) => (
                  <Stack key={idx}>
                    <TextField
                      label="Tag"
                      value={rule.tag}
                      onChange={(val) => updateRule(idx, 'tag', val)}
                    />
                    <TextField
                      label="Discount"
                      value={String(rule.discount)}
                      type="number"
                      onChange={(val) => updateRule(idx, 'discount', Number(val))}
                    />
                    <TextField
                      label="Message"
                      value={rule.message}
                      onChange={(val) => updateRule(idx, 'message', val)}
                    />
                  </Stack>
                ))}
                <Button onClick={addRule}>Add Rule</Button>
                <Button primary onClick={saveRules} style={{ marginTop: '10px' }}>
                  Save Rules
                </Button>
              </>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
