document.getElementById('push-subscribe-btn').addEventListener('click', function() {
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.showSlidedownPrompt();  // shows a nice slide-down prompt
    // Or force a direct permission request:
    // await OneSignal.registerForPushNotifications();
  });
});
