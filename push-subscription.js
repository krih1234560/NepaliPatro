// push-subscription.js
document.addEventListener('DOMContentLoaded', function() {
  const subscribeBtn = document.getElementById('push-subscribe-btn');
  if (!subscribeBtn) return;

  // Check if the user is already subscribed
  OneSignalDeferred.push(async function(OneSignal) {
    const isSubscribed = await OneSignal.isPushNotificationsEnabled();
    if (isSubscribed) {
      subscribeBtn.textContent = '🔔 Notifications On';
      subscribeBtn.style.background = '#2e7d32';
      subscribeBtn.style.color = '#fff';
    }
  });

  subscribeBtn.addEventListener('click', function() {
    OneSignalDeferred.push(async function(OneSignal) {
      // If already subscribed, maybe show status
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      if (isSubscribed) {
        alert('You are already subscribed to notifications.');
        return;
      }
      // Show the prompt
      await OneSignal.showSlidedownPrompt();
      // Or request permission directly:
      // await OneSignal.registerForPushNotifications();
    });
  });
});
