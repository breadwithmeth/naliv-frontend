// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
)

// Initialize the Firebase app in the service worker
// TODO: Replace with your actual Firebase config
firebase.initializeApp({
  apiKey: 'AIzaSyBxkrJl2R49iktFXUYyReSwMd-KKEdJZ8w',
  authDomain: 'naliv-web.firebaseapp.com',
  projectId: 'naliv-web',
  storageBucket: 'naliv-web.firebasestorage.app',
  messagingSenderId: '491619971507',
  appId: '1:491619971507:web:e0c77254d82c5304261bc6',
  measurementId: 'G-GG63GW9EFK',
})

// Retrieve firebase messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'Новое уведомление'
  const notificationOptions = {
    body: payload.notification?.body || 'У вас есть новое уведомление',
    icon: '/firebase-logo.png', // TODO: Replace with your icon
    badge: '/badge-icon.png', // TODO: Replace with your badge icon
    tag: payload.data?.tag || 'default',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Открыть',
        icon: '/open-icon.png',
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/close-icon.png',
      },
    ],
    data: payload.data,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received:', event)

  event.notification.close()

  if (event.action === 'open') {
    // Open the app
    const urlToOpen = event.notification.data?.url || '/'

    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then(function (clientList) {
          // Check if there's already a window/tab open with the target URL
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i]
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }

          // If no window/tab is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})
