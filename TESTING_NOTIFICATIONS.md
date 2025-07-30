# Тестирование FCM уведомлений

Этот документ содержит примеры для тестирования отправки уведомлений.

## 1. Простой Node.js скрипт для тестирования

Создайте файл `test-notification.js`:

```javascript
const admin = require('firebase-admin')

// Инициализация с service account key
const serviceAccount = require('./serviceAccountKey.json') // Скачайте из Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

// Функция для отправки тестового уведомления
async function sendTestNotification(fcmToken) {
  const message = {
    notification: {
      title: '🎉 Тестовое уведомление!',
      body: 'Это тестовое push-уведомление от сервера',
    },
    data: {
      type: 'test',
      timestamp: new Date().toISOString(),
      url: '/',
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        icon: '/firebase-logo.png',
        badge: '/badge-icon.png',
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: 'Открыть приложение',
          },
        ],
      },
    },
    token: fcmToken,
  }

  try {
    const response = await admin.messaging().send(message)
    console.log('✅ Уведомление отправлено успешно:', response)
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления:', error)
  }
}

// Замените на реальный FCM токен из консоли браузера
const testToken = 'YOUR_FCM_TOKEN_HERE'
sendTestNotification(testToken)
```

## 2. cURL запрос для тестирования

```bash
curl -X POST "https://fcm.googleapis.com/v1/projects/naliv-web/messages:send" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "YOUR_FCM_TOKEN",
      "notification": {
        "title": "Заказ обновлен!",
        "body": "Ваш заказ #12345 готов к получению"
      },
      "data": {
        "type": "order",
        "order_id": "12345",
        "url": "/orders/12345"
      },
      "webpush": {
        "headers": {
          "Urgency": "high"
        },
        "notification": {
          "icon": "/firebase-logo.png",
          "badge": "/badge-icon.png",
          "requireInteraction": true
        }
      }
    }
  }'
```

## 3. Как получить Access Token для HTTP API

1. Установите Firebase CLI: `npm install -g firebase-tools`
2. Войдите в аккаунт: `firebase login`
3. Получите токен: `firebase auth:print-access-token`

## 4. Типы уведомлений для приложения

### Уведомление о заказе

```json
{
  "notification": {
    "title": "Заказ обновлен",
    "body": "Ваш заказ #12345 готов к получению"
  },
  "data": {
    "type": "order",
    "order_id": "12345",
    "url": "/orders/12345"
  }
}
```

### Промо уведомление

```json
{
  "notification": {
    "title": "🎉 Специальное предложение!",
    "body": "Скидка 20% на все товары до конца дня"
  },
  "data": {
    "type": "promotion",
    "promo_code": "SAVE20",
    "url": "/catalog"
  }
}
```

### Уведомление о доставке

```json
{
  "notification": {
    "title": "Курьер в пути",
    "body": "Ваш заказ будет доставлен через 15 минут"
  },
  "data": {
    "type": "delivery",
    "order_id": "12345",
    "estimated_time": "15",
    "url": "/orders/12345"
  }
}
```

## 5. Отладка

Для отладки FCM токенов откройте консоль браузера и выполните:

```javascript
// Получить текущий FCM токен
console.log('Current FCM token stored:', localStorage.getItem('fcm_token'))

// Принудительно запросить новый токен
window.requestNotificationPermission?.()
```
