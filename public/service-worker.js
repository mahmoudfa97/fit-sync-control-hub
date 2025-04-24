self.addEventListener("push", (event) => {
    if (event.data) {
      const data = event.data.json()
  
      const options = {
        body: data.notification.body,
        icon: data.notification.icon || "/logo.png",
        badge: "/logo.png",
        data: data.notification.data || {},
      }
  
      event.waitUntil(self.registration.showNotification(data.notification.title, options))
    }
  })
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close()
  
    // Handle notification click
    if (event.notification.data && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url))
    } else {
      event.waitUntil(clients.openWindow("/"))
    }
  })
  