self.addEventListener('push', function(e) {
    var options = {
      body: e.data.text(),
      icon: 'icon.png',
      badge: 'badge.png'
    };
    e.waitUntil(
      self.registration.showNotification('Your App Name', options)
    );
  });
  