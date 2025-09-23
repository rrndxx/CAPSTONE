self.addEventListener("push", (event) => {
  const data = event.data.json();
  const title = data.title || "Netdetect Alert";
  const options = {
    body: data.body,
    data: data.data,
    // icon: "/icons/alert.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationClick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/dashboard"));
});
