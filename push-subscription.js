// push-subscription.js – OneSignal v16 API (fixed)
//
// `OneSignalDeferred` is a QUEUE (a plain array), not a Promise — push a
// callback onto it; OneSignal calls it with the real SDK instance.
//
// The button's state is always derived from OneSignal's own live state
// (OneSignal.User.PushSubscription.optedIn / OneSignal.Notifications.permission)
// rather than from the return value of requestPermission(), whose exact
// shape isn't consistent across SDK builds/browsers. We resync from real
// state after every action instead of guessing from what a call returned.

window.OneSignalDeferred = window.OneSignalDeferred || [];

OneSignalDeferred.push(function (OneSignal) {
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('push-subscribe-btn');
    if (!btn) return;

    // ============================================================
    //  RENDER BUTTON FROM REAL SDK STATE (single source of truth)
    // ============================================================
    function render() {
      let isSubscribed = false;
      try {
        isSubscribed = !!OneSignal.User.PushSubscription.optedIn;
      } catch (error) {
        console.error('[Push] Could not read subscription state:', error);
      }

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
      btn.disabled = false;

      // Leave this log in for now — if the button still won't flip,
      // check the console for what these two values actually are.
      console.log('[Push] state:', {
        optedIn: isSubscribed,
        permission: OneSignal.Notifications.permission
      });
    }

    // ============================================================
    //  INITIAL STATE + LIVE SYNC
    // ============================================================
    render();

    // Fires whenever OneSignal's own subscription state changes —
    // this is the authoritative signal, not our own guess in the click handler.
    OneSignal.User.PushSubscription.addEventListener('change', render);

    // ============================================================
    //  CLICK HANDLER – TOGGLE SUBSCRIBE/UNSUBSCRIBE
    // ============================================================
    btn.addEventListener('click', async function () {
      btn.disabled = true;
      btn.textContent = '⏳ Loading...';

      try {
        const isSubscribed = OneSignal.User.PushSubscription.optedIn;

        if (isSubscribed) {
          // ---- UNSUBSCRIBE ----
          await OneSignal.User.PushSubscription.optOut();
        } else {
          // ---- SUBSCRIBE ----
          // Shows the native browser permission prompt (if not already decided).
          await OneSignal.Notifications.requestPermission();

          // Don't trust requestPermission()'s return value — re-check the
          // SDK's own permission flag, which is documented and consistent.
          if (OneSignal.Notifications.permission) {
            await OneSignal.User.PushSubscription.optIn();
          } else {
            alert('Permission denied. Please allow notifications in your browser settings.');
          }
        }
      } catch (error) {
        console.error('[Push] Toggle error:', error);
        alert('Something went wrong. Please try again.\n\nError: ' + error.message);
      }

      // Always resync the button from real state — covers the case where
      // 'change' already fired, and also covers cases where it didn't.
      render();
    });

    // ============================================================
    //  REFRESH STATE ON VISIBILITY CHANGE
    // ============================================================
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) render();
    });
  });
});
