import webPush from 'web-push';

export interface Env {
  PUSH_SUBSCRIPTIONS: KVNamespace;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  NOTIFY_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // ---------- Subscribe ----------
      if (path === '/subscribe' && request.method === 'POST') {
        const subscription = await request.json();
        const endpoint = (subscription as any).endpoint;
        await env.PUSH_SUBSCRIPTIONS.put(endpoint, JSON.stringify(subscription));
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ---------- Unsubscribe ----------
      if (path === '/subscribe' && request.method === 'DELETE') {
        const { endpoint } = await request.json();
        await env.PUSH_SUBSCRIPTIONS.delete(endpoint);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ---------- Notify ----------
      if (path === '/notify' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${env.NOTIFY_SECRET}`) {
          return new Response('Unauthorized', { status: 401 });
        }

        const { title, body, icon, data } = await request.json();

        webPush.setVapidDetails(
          'mailto:https://nepalipatro.krishc155.workers.dev/', // <-- replace with your email or URL
          env.VAPID_PUBLIC_KEY,
          env.VAPID_PRIVATE_KEY
        );

        const list = await env.PUSH_SUBSCRIPTIONS.list();
        const subscriptions: PushSubscription[] = [];
        for (const key of list.keys) {
          const sub = await env.PUSH_SUBSCRIPTIONS.get(key.name, 'json');
          if (sub) subscriptions.push(sub);
        }

        const payload = JSON.stringify({ title, body, icon, data });

        const results = await Promise.allSettled(
          subscriptions.map(async (sub) => {
            try {
              await webPush.sendNotification(sub, payload, {
                TTL: 86400,
                urgency: 'normal',
              });
              return { endpoint: sub.endpoint, status: 'sent' };
            } catch (err: any) {
              if (err.statusCode === 410) {
                await env.PUSH_SUBSCRIPTIONS.delete(sub.endpoint);
              }
              return { endpoint: sub.endpoint, status: 'failed', error: err.message };
            }
          })
        );

        const sent = results.filter(r => r.value?.status === 'sent').length;
        return new Response(JSON.stringify({ success: true, sent, total: subscriptions.length }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not found', { status: 404 });

    } catch (err: any) {
      console.error('Worker error:', err);
      return new Response(
        JSON.stringify({
          error: err.message,
          stack: err.stack,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
