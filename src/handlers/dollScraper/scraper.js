const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// One shared browser for every check
let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', 'disable-dev-shm-usage'],
    }).then((browser) => {
      browser.on('disconnected', () => { browserPromise = null; }); // relaunch if it dies
      return browser;
    });
  }
  return browserPromise;
}

async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  browserPromise = null;
  await browser.close();
}

const scraper = async (url, elementSelector, priceElementSelector, { screenshot = true } = {}) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(USER_AGENT);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.setViewport({ width: 1280, height: 800 });

    // Skip fonts and video; keep images/CSS so the screenshot still looks right
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (type === 'font' || type === 'media') req.abort();
      else req.continue();
    });

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      referer: 'https://www.google.com/',
      timeout: 30000,
    });

    try {
      await page.waitForSelector(priceElementSelector, { timeout: 5000 });
    } catch (err) {
      console.log('waitForSelector failed: ', err.message);
    }

    const result = await page.evaluate((elSelector, priceSelector) => {
      const getValue = (el) => {
        if (!el) return null;
        if (el.tagName === 'META') return el.getAttribute('content')?.trim() || null;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.value?.trim() || null;
        return el.textContent?.trim() || null;
      };

      const scope = elSelector ? document.querySelector(elSelector) : document;
      if (elSelector && !scope) {
        return { title: null, price: null, url: null, found: false };
      }

      const priceEl = scope.querySelector(priceSelector);
      const price = getValue(priceEl);

      const linkEl = scope.querySelector('a');
      const url = linkEl?.href ?? null;

      const title = document.title || null;

      return { title, price, url, found: !!priceEl };
    }, elementSelector, priceElementSelector);

    const ssBuffer = screenshot ? await page.screenshot() : null;
    return { ...result, screenshot: ssBuffer };
  } finally {
    await page.close(); // always closes the tab, even on errors
  }
};

module.exports = { scraper, closeBrowser };
