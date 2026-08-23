// push-subscription.js – OneSignal v16 API
//
// Two separate buttons swap visibility based on subscription state,
// rather than one button changing its own label:
//   #push-subscribe-btn    -> shown when NOT subscribed
//   #push-unsubscribe-btn  -> shown when subscribed
//
// `OneSignalDeferred` is a QUEUE (a plain array), not a Promise — push a
// callback onto it; OneSignal calls it with the real SDK instance.
//
// The buttons' visibility is always derived from OneSignal's own live
// state (OneSignal.User.PushSubscription.optedIn / OneSignal.Notifications.permission)
// rather than from the return value of requestPermission(), whose exact
// shape isn't consistent across SDK builds/browsers.

window.OneSignalDeferred = window.OneSignalDeferred || [];

OneSignalDeferred.push(function (OneSignal) {
  document.addEventListener('DOMContentLoaded', function () {
    const subscribeBtn = document.getElementById('push-subscribe-btn');
    const unsubscribeBtn = document.getElementById('push-unsubscribe-btn');
    if (!subscribeBtn || !unsubscribeBtn) return;

    // ============================================================
    //  RENDER: SHOW ONE BUTTON, HIDE THE OTHER, FROM REAL SDK STATE
    // ============================================================
    function render() {
      let isSubscribed = false;
      try {
        isSubscribed = !!OneSignal.User.PushSubscription.optedIn;
      } catch (error) {
        console.error('[Push] Could not read subscription state:', error);
      }

      if (isSubscribed) {
        subscribeBtn.style.display = 'none';
        unsubscribeBtn.style.display = '';
      } else {
        subscribeBtn.style.display = '';
        unsubscribeBtn.style.display = 'none';
      }

      subscribeBtn.disabled = false;
      unsubscribeBtn.disabled = false;

      // Leave this log in for now — helpful if the buttons ever seem stuck.
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
    // this is the authoritative signal, not a guess made in the click handlers.
    OneSignal.User.PushSubscription.addEventListener('change', render);

    // ============================================================
    //  SUBSCRIBE BUTTON
    // ============================================================
    subscribeBtn.addEventListener('click', async function () {
      subscribeBtn.disabled = true;
      subscribeBtn.textContent = '⏳ Loading...';

      try {
        // Shows the native browser permission prompt (if not already decided).
        await OneSignal.Notifications.requestPermission();

        // Don't trust requestPermission()'s return value — re-check the
        // SDK's own permission flag, which is documented and consistent.
        if (OneSignal.Notifications.permission) {
          await OneSignal.User.PushSubscription.optIn();
        } else {
          alert('Permission denied. Please allow notifications in your browser settings.');
        }
      } catch (error) {
        console.error('[Push] Subscribe error:', error);
        alert('Something went wrong. Please try again.\n\nError: ' + error.message);
      }

      subscribeBtn.textContent = '🔔 Enable Notifications';
      render();
    });

    // ============================================================
    //  UNSUBSCRIBE BUTTON
    // ============================================================
    unsubscribeBtn.addEventListener('click', async function () {
      unsubscribeBtn.disabled = true;
      unsubscribeBtn.textContent = '⏳ Loading...';

      try {
        await OneSignal.User.PushSubscription.optOut();
      } catch (error) {
        console.error('[Push] Unsubscribe error:', error);
        alert('Something went wrong. Please try again.\n\nError: ' + error.message);
      }

      unsubscribeBtn.textContent = '🔕 Disable Notifications';
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
