import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyBxkrJl2R49iktFXUYyReSwMd-KKEdJZ8w',
  authDomain: 'naliv-web.firebaseapp.com',
  projectId: 'naliv-web',
  storageBucket: 'naliv-web.firebasestorage.app',
  messagingSenderId: '491619971507',
  appId: '1:491619971507:web:e0c77254d82c5304261bc6',
  measurementId: 'G-GG63GW9EFK',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app)

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export { messaging }

// Function to get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      console.log('Notification permission granted.')

      // Get registration token
      const token = await getToken(messaging, {
        vapidKey:
          'BJqEfGyZbHKcPvsDU4XCLC5756ujLfz74f729o0ofsXA1a81J1PlmJ0n_SC-2C-iZfXFh4KLztHdkV48QeTy5c0', // TODO: Replace with your VAPID key
      })

      if (token) {
        console.log('FCM Registration token:', token)
        // Send the token to your server to save it
        await sendTokenToServer(token)
        return token
      } else {
        console.log('No registration token available.')
      }
    } else {
      console.log('Unable to get permission to notify.')
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error)
  }
  return null
}

// Function to send token to your server
const sendTokenToServer = async (token: string) => {
  try {
    // Generate a simple device ID based on browser fingerprint
    const deviceId = btoa(navigator.userAgent + navigator.language).slice(0, 16)

    const response = await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        fcm_token: token,
        device_type: 'web',
        device_id: deviceId,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('FCM token registered successfully:', data.message)
    } else {
      const errorData = await response.json()
      console.error(
        'Failed to register FCM token:',
        errorData.message || 'Unknown error'
      )
    }
  } catch (error) {
    console.error('Error sending FCM token to server:', error)
  }
}

// Handle incoming messages when the app is in the foreground
export const onMessageListener = () => {
  return new Promise(resolve => {
    onMessage(messaging, payload => {
      console.log('Message received in foreground:', payload)
      resolve(payload)
    })
  })
}
