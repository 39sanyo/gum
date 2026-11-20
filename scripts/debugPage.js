const puppeteer = require('puppeteer-extra');
puppeteer.use(require('puppeteer-extra-plugin-stealth')());

(async () => {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const res = await page.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('status:', res && res.status());
  console.log('final url:', page.url());
  console.log('title:', JSON.stringify(await page.title()));
  const html = await page.content();
  console.log('html length:', html.length);
  console.log(html.slice(0, 600));
  await browser.close();
})();
