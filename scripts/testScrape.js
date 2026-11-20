const fs = require('fs');
const { dollSearch } = require('../src/handlers/dollScraper/dollSearch');
const { closeBrowser } = require('../src/handlers/dollScraper/scraper');

(async () => {
  const r = await dollSearch(process.argv[2], { screenshot: true });
  console.log({ title: r.title, price: r.price, found: r.found });
  if (r.screenshot) fs.writeFileSync('test.png', r.screenshot);
  await closeBrowser();
})();
