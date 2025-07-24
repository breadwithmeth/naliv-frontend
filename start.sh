#!/bin/bash

echo "🚀 Naliv Frontend - Quick Start"
echo "==============================="
echo ""

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаю зависимости..."
    npm install
    echo ""
fi

# Проверяем линтинг
echo "🔍 Проверяю код..."
npm run lint
echo ""

# Форматируем код
echo "✨ Форматирую код..."
npm run format
echo ""

# Запускаем dev сервер
echo "🌐 Запускаю dev сервер..."
echo "Проект будет доступен по адресу: http://localhost:5173"
echo ""
npm run dev
