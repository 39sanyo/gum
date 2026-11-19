const { dollSearch } = require('./dollScraper/dollSearch');
const { insertDollMaster, getDollByUrl } = require('./dollMaster');

function parsePrice(raw) {
  if (!raw) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? null : n;
}

async function checkDoll(url, fallbackName, options) {
  const shouldScrenshot = (result) => {
      const newPrice = parsePrice(result.price);
      if (newPrice === null) return false;
      const existing = getDollByUrl(url);
      return !existing || existing.current_price !== newPrice;
  };

  const scrape = await dollSearch(url, {screenshot: shouldScrenshot, ...options});
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
