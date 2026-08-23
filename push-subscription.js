// push-subscription.js – OneSignal v16 API (fixed)

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('push-subscribe-btn');
  if (!btn) return;

  // ============================================================
  //  UPDATE BUTTON STATE (v16 API)
  // ============================================================
  async function updateButtonState() {
    try {
      const OneSignal = await OneSignalDeferred;
      // v16: subscription status is on User.PushSubscription.optedIn
      const isSubscribed = await OneSignal.User.PushSubscription.optedIn;

      if (isSubscribed) {
        btn.textContent = '🔔 Unsubscribe';
        btn.style.background = '#c62828';
        btn.style.color = '#fff';
        btn.dataset.subscribed = 'true';
      } else {
        btn.textContent = '🔔 Enable Notifications';
        btn.style.background = '#f4aa2a';
        btn.style.color = '#123b6d';
        btn.dataset.subscribed = 'false';
      }
    } catch (error) {
      console.error('Error updating button state:', error);
      btn.textContent = '🔔 Enable Notifications';
      btn.dataset.subscribed = 'false';
    }
  }

  // ============================================================
  //  INITIAL STATE
  // ============================================================
  updateButtonState();

  // ============================================================
  //  CLICK HANDLER – TOGGLE SUBSCRIBE/UNSUBSCRIBE
  // ============================================================
  btn.addEventListener('click', async function() {
    btn.disabled = true;
    btn.textContent = '⏳ Loading...';

    try {
      const OneSignal = await OneSignalDeferred;
      const isSubscribed = await OneSignal.User.PushSubscription.optedIn;

      if (isSubscribed) {
        // ---- UNSUBSCRIBE ----
        await OneSignal.User.PushSubscription.optOut();
        btn.textContent = '🔔 Enable Notifications';
        btn.style.background = '#f4aa2a';
        btn.style.color = '#123b6d';
        btn.dataset.subscribed = 'false';
        alert('You have unsubscribed from notifications.');
      } else {
        // ---- SUBSCRIBE ----
        // Request permission (shows browser's native prompt)
        const result = await OneSignal.Notifications.requestPermission();

        if (result === 'granted') {
          btn.textContent = '🔔 Unsubscribe';
          btn.style.background = '#c62828';
          btn.style.color = '#fff';
          btn.dataset.subscribed = 'true';
          alert('You have subscribed to notifications!');
        } else {
          // User denied or dismissed
          btn.textContent = '🔔 Enable Notifications';
          btn.style.background = '#f4aa2a';
          btn.style.color = '#123b6d';
          btn.dataset.subscribed = 'false';
          alert('Permission denied. Please allow notifications in your browser settings.');
        }
      }
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Something went wrong. Please try again.\n\nError: ' + error.message);
    }

    btn.disabled = false;
  });

  // ============================================================
  //  REFRESH STATE ON VISIBILITY CHANGE
  // ============================================================
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      updateButtonState();
    }
  });
});
