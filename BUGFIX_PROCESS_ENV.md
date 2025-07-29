# Исправление ошибки "Can't find variable: process"

## Проблема
При попытке добавить карту возникала ошибка:
```
ReferenceError: Can't find variable: process
```

## Причина
В коде использовалась переменная `process.env.REACT_APP_API_URL`, которая доступна только в Node.js окружении, но не в браузере при использовании Vite.

## Решение
1. **Исправлена переменная окружения**: заменено `process.env.REACT_APP_API_URL` на `import.meta.env.VITE_API_URL`
2. **Добавлена типизация**: создан файл `src/vite-env.d.ts` с типами для переменных окружения
3. **Настроены файлы окружения**: созданы `.env` и `.env.example`

## Изменения в файлах

### src/hooks/useCardSaving.ts
```typescript
// Было:
postLink: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/payments/save-card/postlink`

// Стало:
postLink: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/save-card/postlink`
```

### Новые файлы:
- `src/vite-env.d.ts` - типизация для Vite переменных окружения
- `.env` - переменные окружения для разработки
- `.env.example` - пример настройки переменных

## Результат
✅ Ошибка исправлена
✅ Приложение успешно компилируется
✅ Dev сервер работает корректно
✅ Модальное окно добавления карты теперь функционирует

## Как проверить
1. Запустите `npm run dev`
2. Перейдите на страницу оформления заказа
3. Нажмите "Добавить карту"
4. Убедитесь, что модальное окно открывается без ошибок в консоли
