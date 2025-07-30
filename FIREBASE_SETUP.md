# Настройка Firebase для Push-уведомлений

## 1. Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Создайте новый проект или выберите существующий
3. В разделе "Project Settings" -> "General" найдите конфигурацию веб-приложения

## 2. Настройка Cloud Messaging

1. В Firebase Console перейдите в раздел "Cloud Messaging"
2. Сгенерируйте VAPID ключ в разделе "Web configuration"
3. Скопируйте Server Key для использования на backend

## 3. Обновление конфигурации

Замените placeholder значения в файлах:

### src/utils/firebase.ts

```javascript
const firebaseConfig = {
  apiKey: 'your-actual-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
}

// Замените your-vapid-key на ваш VAPID ключ
vapidKey: 'your-actual-vapid-key'
```

### public/firebase-messaging-sw.js

```javascript
firebase.initializeApp({
  apiKey: 'your-actual-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
})
```

## 4. Backend API

Добавьте endpoint для регистрации FCM токенов:

### POST `/api/notifications/register-token`

Регистрирует FCM токен для получения push-уведомлений.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**

```json
{
  "fcm_token": "string (required) - FCM токен устройства",
  "device_type": "string (optional) - Тип устройства (ios, android, web)",
  "device_id": "string (optional) - Уникальный ID устройства"
}
```

**Response:**

```json
{
  "success": true,
  "message": "FCM токен успешно зарегистрирован"
}
```

## 5. Отправка уведомлений

### Использование Firebase Admin SDK (рекомендуется)

```javascript
const admin = require('firebase-admin')

// Инициализация Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

// Отправка уведомления
const message = {
  notification: {
    title: 'Заказ готов!',
    body: 'Ваш заказ #12345 готов к получению',
  },
  data: {
    type: 'order',
    order_id: '12345',
    url: '/orders/12345',
  },
  token: 'user-fcm-token',
}

admin
  .messaging()
  .send(message)
  .then(response => {
    console.log('Successfully sent message:', response)
  })
  .catch(error => {
    console.log('Error sending message:', error)
  })
```

### Использование HTTP API

```javascript
// POST запрос к FCM HTTP v1 API
POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
  Content-Type: application/json

Body:
{
  "message": {
    "token": "user-fcm-token",
    "notification": {
      "title": "Заказ готов!",
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
        "requireInteraction": true,
        "actions": [
          {
            "action": "open",
            "title": "Открыть заказ"
          }
        ]
      }
    }
  }
}
```

## 6. Тестирование

1. Откройте приложение в браузере
2. Разрешите уведомления когда появится запрос
3. Нажмите кнопку 🔔 рядом с "Активные заказы" для создания тестового уведомления
4. Откройте панель уведомлений кликнув на иконку колокольчика в header

## 7. Иконки уведомлений

Добавьте иконки в папку `public/`:

- `firebase-logo.png` - основная иконка
- `badge-icon.png` - иконка для badge
- `open-icon.png` - иконка для действия "Открыть"
- `close-icon.png` - иконка для действия "Закрыть"

## Особенности

- Уведомления работают в фоне благодаря Service Worker
- Все уведомления сохраняются в localStorage
- Поддерживаются разные типы уведомлений (заказы, промо, информация)
- Счетчик непрочитанных уведомлений отображается на иконке
- Клик по уведомлению может перенаправлять на нужную страницу
