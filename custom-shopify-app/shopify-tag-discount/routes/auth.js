import express from 'express';
import { shopifyApi, RequestedTokenType } from '@shopify/shopify-api';

const router = express.Router();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  apiVersion: 'unstable',
  appUrl: process.env.SHOPIFY_STORE_URL || '',
  scopes: process.env.SHOPIFY_SCOPES?.split(','),
  hostScheme: process.env.SHOPIFY_APP_HOST?.split('://')[0],
  hostName: process.env.SHOPIFY_APP_HOST?.replace(/https?:\/\//, ''),
  isEmbeddedApp: true,
});

function getSessionTokenHeader(request) {
  return request.headers['authorization']?.replace('Bearer ', '');
}

function getSessionTokenFromUrlParam(request) {
  const searchParams = new URLSearchParams(request.url);
  return searchParams.get('id_token');
}

function redirectToSessionTokenBouncePage(req, res) {
  const searchParams = new URLSearchParams(req.query);
  searchParams.delete('id_token');
  searchParams.append('shopify-reload', `${req.path}?${searchParams.toString()}`);
  res.redirect(`/session-token-bounce?${searchParams.toString()}`);
}

router.get('/session-token-bounce', (req, res) => {
  res.setHeader("Content-Type", "text/html");
  const html = `
    <head>
      <meta name="shopify-api-key" content="${process.env.SHOPIFY_API_KEY}" />
      <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
    </head>`;
  res.send(html);
});

router.get('/authorize', async (req, res) => {
  let encodedSessionToken = null;
  let decodedSessionToken = null;
  try {
    encodedSessionToken =
      getSessionTokenHeader(req) || getSessionTokenFromUrlParam(req);

    decodedSessionToken = await shopify.session.decodeSessionToken(
      encodedSessionToken
    );
  } catch (e) {
    const isDocumentRequest = !req.headers["authorization"];
    if (isDocumentRequest) {
      return redirectToSessionTokenBouncePage(req, res);
    }

    return res.status(401).setHeader("X-Shopify-Retry-Invalid-Session-Request", "1").end();
  }

  const dest = new URL(decodedSessionToken.dest);
  const shop = dest.hostname;
  const accessToken = await shopify.auth.tokenExchange({
    shop,
    sessionToken: encodedSessionToken,
    requestedTokenType: RequestedTokenType.OnlineAccessToken,
  });

  res.setHeader("Content-Type", "text/html");
  const html = `
    <body>
      <h1>Retrieved access Token</h1>
      <p>${JSON.stringify(accessToken, null, 2)}</p>
    </body>`;
  res.send(html);
});

export default router;