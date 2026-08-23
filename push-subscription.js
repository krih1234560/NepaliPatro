// push-subscription.js - Toggle Subscribe/Unsubscribe with OneSignal

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('push-subscribe-btn');
  if (!btn) return;

  // Helper to update button UI based on subscription state
  async function updateButtonState() {
    try {
      const OneSignal = await OneSignalDeferred;
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      
      if (isSubscribed) {
        btn.textContent = '🔔 Unsubscribe';
        btn.style.background = '#c62828';  // Red color for unsubscribe
        btn.style.color = '#fff';
        btn.dataset.subscribed = 'true';
      } else {
        btn.textContent = '🔔 Enable Notifications';
        btn.style.background = '#f4aa2a';  // Gold color for subscribe
        btn.style.color = '#123b6d';
        btn.dataset.subscribed = 'false';
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      btn.textContent = '🔔 Enable Notifications';
      btn.dataset.subscribed = 'false';
    }
  }

  // Initial state
  updateButtonState();

  // Click handler – toggle subscription
  btn.addEventListener('click', async function() {
    // Disable button to prevent double clicks
    btn.disabled = true;
    btn.textContent = '⏳ Loading...';

    try {
      const OneSignal = await OneSignalDeferred;
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();

      if (isSubscribed) {
        // --- UNSUBSCRIBE ---
        await OneSignal.setSubscription(false);
        // After unsubscription, update UI
        btn.textContent = '🔔 Enable Notifications';
        btn.style.background = '#f4aa2a';
        btn.style.color = '#123b6d';
        btn.dataset.subscribed = 'false';
        alert('You have unsubscribed from notifications.');
      } else {
        // --- SUBSCRIBE ---
        // Show the OneSignal native prompt (slide-down or browser permission)
        await OneSignal.showSlidedownPrompt();
        // Alternatively, force direct permission request:
        // await OneSignal.registerForPushNotifications();

        // After the prompt, we need to check if the user actually subscribed.
        // We'll wait a moment and re-check.
        setTimeout(async () => {
          const newStatus = await OneSignal.isPushNotificationsEnabled();
          if (newStatus) {
            btn.textContent = '🔔 Unsubscribe';
            btn.style.background = '#c62828';
            btn.style.color = '#fff';
            btn.dataset.subscribed = 'true';
            alert('You have subscribed to notifications!');
          } else {
            // User might have denied permission or dismissed the prompt
            btn.textContent = '🔔 Enable Notifications';
            btn.style.background = '#f4aa2a';
            btn.style.color = '#123b6d';
            btn.dataset.subscribed = 'false';
          }
          btn.disabled = false;
        }, 3000);
        return; // early return to avoid re-enabling immediately
      }
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Something went wrong. Please try again.');
    }

    // Re-enable button after async operations (only for unsubscribe path)
    btn.disabled = false;
    // Update state one more time to be sure
    await updateButtonState();
  });

  // Optional: Refresh state when the page becomes visible again (in case user changed settings)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      updateButtonState();
    }
  });

  // Also refresh when coming back online
  window.addEventListener('online', function() {
    updateButtonState();
  });
});
