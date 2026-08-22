import webPush from 'web-push';
// or const webPush = require('web-push');

async function sendNotification() {
  const result = await webPush.sendNotification(subscription, payload, {
    vapidDetails: {
      subject: 'https://nepalipatro.krishc155.workers.dev/',
      publicKey: process.env.VAPID_PUBLIC_KEY, // Bun uses process.env or Bun.env
      privateKey: process.env.VAPID_PRIVATE_KEY,
    },
    TTL: 86400,
  });
  console.log(result);
}

sendNotification();
