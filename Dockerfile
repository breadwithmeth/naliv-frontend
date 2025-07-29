# Dockerfile для фронтенда на Vite
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Экспонируем порт
EXPOSE 8080

# Запускаем приложение
CMD ["npm", "start"]
