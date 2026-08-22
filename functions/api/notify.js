// functions/api/notify.js

export async function onRequest(context) {
  const { request, env } = context;

  // 1. Check Authorization header (protect this endpoint)
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.NOTIFY_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // 2. Parse the notification payload
  const { title, body, icon, data } = await request.json();

  // 3. Get all subscriptions from KV
  const list = await env.PUSH_SUBSCRIPTIONS.list();
  const subscriptions = [];
  for (const key of list.keys) {
    const sub = await env.PUSH_SUBSCRIPTIONS.get(key.name, 'json');
    if (sub) subscriptions.push(sub);
  }

  // 4. Send a push to each subscription (using web-push library)
  // Since Cloudflare Functions support npm packages, we'll use web-push.
  // You must add "web-push" to your project's dependencies.
  const webPush = await import('web-push');

  // Set VAPID details from environment variables
  webPush.setVapidDetails(
    'mailto:your-email@example.com', // Replace with your email
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  const payload = JSON.stringify({ title, body, icon, data });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(sub, payload, {
          TTL: 86400, // 24 hours
          urgency: 'normal',
        });
        return { endpoint: sub.endpoint, status: 'sent' };
      } catch (err) {
        // If subscription is expired (410), delete it
        if (err.statusCode === 410) {
          await env.PUSH_SUBSCRIPTIONS.delete(sub.endpoint);
        }
        return { endpoint: sub.endpoint, status: 'failed', error: err.message };
      }
    })
  );

  const sentCount = results.filter(r => r.value?.status === 'sent').length;

  return new Response(JSON.stringify({ success: true, sent: sentCount, total: subscriptions.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
