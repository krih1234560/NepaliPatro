// push-subscription.js - OneSignal Integration for Nepali Patro

document.addEventListener('DOMContentLoaded', function() {
  const subscribeBtn = document.getElementById('push-subscribe-btn');
  if (!subscribeBtn) return;

  // 1. Check if already subscribed and update button text
  OneSignalDeferred.push(async function(OneSignal) {
    const isSubscribed = await OneSignal.isPushNotificationsEnabled();
    if (isSubscribed) {
      subscribeBtn.textContent = '✅ Notifications On';
      subscribeBtn.style.background = '#2e7d32';
      subscribeBtn.style.color = '#fff';
    } else {
      subscribeBtn.textContent = '🔔 Enable Notifications';
    }
  });

  // 2. Handle button click
  subscribeBtn.addEventListener('click', async function() {
    // Disable button to prevent double clicks
    subscribeBtn.disabled = true;
    subscribeBtn.textContent = '⏳ Loading...';

    try {
      const OneSignal = await OneSignalDeferred;
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();

      if (isSubscribed) {
        alert('You are already subscribed to notifications!');
        subscribeBtn.disabled = false;
        return;
      }

      // Show OneSignal's native prompt (slide-down or browser permission)
      await OneSignal.showSlidedownPrompt();
      
      // Optional: If you want to force the browser's native prompt instead:
      // await OneSignal.registerForPushNotifications();

    } catch (error) {
      console.error('Subscription error:', error);
      alert('Something went wrong. Please try again.');
    }

    // Re-enable button and update state after a moment
    setTimeout(() => {
      subscribeBtn.disabled = false;
      // Re-check state (optional, but good for UI sync)
      OneSignalDeferred.push(async function(OneSignal) {
        const sub = await OneSignal.isPushNotificationsEnabled();
        if (sub) {
          subscribeBtn.textContent = '✅ Notifications On';
          subscribeBtn.style.background = '#2e7d32';
          subscribeBtn.style.color = '#fff';
        } else {
          subscribeBtn.textContent = '🔔 Enable Notifications';
        }
      });
    }, 3000);
  });
});
