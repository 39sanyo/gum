const { dollSearch } = require('./dollScraper/dollSearch');
const { insertDollMaster } = require('./dollMaster');

function parsePrice(raw) {
  if (!raw) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? null : n;
}

async function checkDoll(url, fallbackName) {
  const scrape = await dollSearch(url);
  const price = parsePrice(scrape.price);

  let db = null;
  if (price !== null) {
    db = insertDollMaster({
      name: scrape.title || fallbackName || 'Unknown Doll',
      listing_url: url,
      price,
    });
  }
  return { scrape, price, db };
}

module.exports = { checkDoll };
