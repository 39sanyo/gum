const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const scraper = async (url, elementSelector, priceElementSelector) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    ); await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(url, {
        waitUntil: 'domcontentloaded',
        referer: 'https://www.google.com/',
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
        await page.waitForSelector(priceElementSelector, { timeout: 5000 });
    } catch (err) {
        console.log('waitForSelector failed: ', err.message);
    }

    const debugInfo = await page.evaluate((elSelector, priceSelector) => {
        return {
            containerExists: elSelector ? !!document.querySelector(elSelector) : true,
            priceElExists: !!document.querySelector(priceSelector),
            bodyPreview: document.body.innerText.slice(0, 300),
        };
    }, elementSelector, priceElementSelector);
    console.log('DEBUG:', debugInfo);

    // await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });

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


        return { title, price, url, found: !!priceEl};
    }, elementSelector, priceElementSelector);

    const ssBuffer = await page.screenshot();
    await browser.close();
    return { result, screenshot: ssBuffer };
};

const finder = async () => {
    const browser = await puppeteer.launch();
    const page =  await browser.newPage();
    await page.goto(url);

}

module.exports = { scraper };
