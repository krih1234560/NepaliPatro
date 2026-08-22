// push-worker/src/index.js

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for client requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // === SUBSCRIBE ===
    if (path === '/subscribe' && request.method === 'POST') {
      const subscription = await request.json();
      // Validate and store in KV
      const endpoint = subscription.endpoint;
      await env.PUSH_SUBSCRIPTIONS.put(endpoint, JSON.stringify(subscription));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // === SEND NOTIFICATION (optional: add authentication to protect) ===
    if (path === '/notify' && request.method === 'POST') {
      const { title, body, icon, data } = await request.json();

      // Get all subscriptions from KV
      const list = await env.PUSH_SUBSCRIPTIONS.list();
      const promises = list.keys.map(async (key) => {
        const subData = await env.PUSH_SUBSCRIPTIONS.get(key.name, 'json');
        if (!subData) return;
        // Send push via Web Push API
        await sendPushNotification(subData, title, body, icon, data, env);
      });
      await Promise.allSettled(promises);

      return new Response(JSON.stringify({ success: true, count: list.keys.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

// Helper: send a push notification using the Web Push protocol
async function sendPushNotification(subscription, title, body, icon, data, env) {
  const vapidPublicKey = env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = env.VAPID_PRIVATE_KEY;

  const payload = JSON.stringify({ title, body, icon, data });

  const encodedPayload = new TextEncoder().encode(payload);

  const options = {
    method: 'POST',
    headers: {
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      'Content-Type': 'application/json',
    },
    body: encodedPayload,
  };

  // Generate the Authorization header (VAPID)
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(vapidPrivateKey), c => c.charCodeAt(0)),
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Build VAPID JWT (simplified – use a library or manually construct)
  // For production, consider using `web-push` library or a helper.
  // Here we assume you have a function to generate the JWT.
  // You can implement `generateVapidHeader` as per Web Push spec.
  // (For brevity, we skip JWT generation code – see full example in the docs.)

  // Actually, it's easier to use the `web-push` library in a Worker.
  // Because Workers support Node.js compatibility, you can use:
  // import webPush from 'web-push';
  // But we'll illustrate with a simpler inline approach.

  // We'll just show the final fetch call (assuming headers are built)
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      'Content-Type': 'application/json',
      // Authorization: 'WebPush ...'  (VAPID)
    },
    body: encodedPayload,
  });

  if (!response.ok) {
    // If endpoint returns 410 (gone), delete subscription
    if (response.status === 410) {
      await env.PUSH_SUBSCRIPTIONS.delete(subscription.endpoint);
    }
    console.error('Push error:', response.status, await response.text());
  }
}
