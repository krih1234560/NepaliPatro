(function() {
  'use strict';

  const WORKER_URL = 'https://nepalipatro.krishc155.workers.dev/'; // Replace with your Worker URL
  const VAPID_PUBLIC_KEY = 'BNQcMvssOBOCBDKvEgfUE6p3Eb1Ztr66LqfLNYhhTbSyrkY38ImsLDpZGonE2B3SgaM53fHasD2WWEn_f5xgc7U'; // Must be same as in Worker

  let isSubscribed = false;
  let swRegistration = null;

  // Check if service worker is registered and push is supported
  async function initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push not supported');
      return;
    }

    swRegistration = await navigator.serviceWorker.ready;
    const subscription = await swRegistration.pushManager.getSubscription();
    isSubscribed = !(subscription === null);

    updateUI(subscription);

    // Listen for subscription changes
    document.getElementById('push-subscribe-btn')?.addEventListener('click', async () => {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    });
  }

  async function subscribe() {
    if (!swRegistration) return;

    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to your Cloudflare Worker
      await fetch(WORKER_URL + '/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      isSubscribed = true;
      updateUI(subscription);
      showToast('✅ Push notifications enabled!');
    } catch (err) {
      console.error('Subscription failed:', err);
      showToast('❌ Failed to subscribe. Please try again.');
    }
  }

  async function unsubscribe() {
    if (!swRegistration) return;

    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      // Optionally, tell server to remove subscription
      await fetch(WORKER_URL + '/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      isSubscribed = false;
      updateUI(null);
      showToast('🔕 Push notifications disabled');
    }
  }

  function updateUI(subscription) {
    const btn = document.getElementById('push-subscribe-btn');
    if (!btn) return;
    if (isSubscribed) {
      btn.textContent = '🔕 Disable Notifications';
      btn.classList.add('subscribed');
    } else {
      btn.textContent = '🔔 Enable Notifications';
      btn.classList.remove('subscribed');
    }
  }

  function showToast(msg) {
    // Simple toast – you can enhance
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #123b6d; color: #fff; padding: 12px 24px;
      border-radius: 30px; font-weight: 600; z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
