import puppeteer from 'puppeteer'

async function takeScreenshot() {
  console.log('Запуск Puppeteer...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Устанавливаем размер viewport
    await page.setViewport({ width: 1280, height: 720 })

    console.log('Переход на http://localhost:5173...')

    // Переходим на главную страницу
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle2',
      timeout: 10000,
    })

    // Ждём, пока страница полностью загрузится
    await page.waitForSelector('h1', { timeout: 5000 })

    console.log('Создание скриншота...')

    // Делаем скриншот
    await page.screenshot({
      path: 'screenshot.png',
      fullPage: true,
    })

    console.log('Скриншот сохранён как screenshot.png')
  } catch (error) {
    console.error('Ошибка при создании скриншота:', error)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

takeScreenshot()
