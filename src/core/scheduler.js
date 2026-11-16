const { getAllDolls } = require('../handlers/dollMaster');
const { checkDoll } = require('../handlers/checkDoll');
const { notifyPriceChange } = require('../plugins/messages/notifier');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let running = false;

async function checkAllDolls(client) {
  if (running) return;
  running = true;
  console.log('[scheduler] Checking all dolls...');

  try {
    for (const doll of getAllDolls()) {
      try {
        const { scrape, db } = await checkDoll(doll.listing_url, doll.name);
        await notifyPriceChange(client, db, scrape.screenshot);
      } catch (err) {
        console.error(`[scheduler] Failed on ${doll.listing_url}:`, err.message);
      }
      await sleep(3000);
    }
  } finally {
    running = false;
    console.log('[scheduler] Done.');
  }
}

function startScheduler(client) {
  const seconds = Number(process.env.CHECK_INTERVAL_SECONDS) || 30;
  console.log(`[scheduler] Checking every ${seconds}s`);
  checkAllDolls(client);
  setInterval(() => checkAllDolls(client), seconds * 1000);
}

module.exports = { startScheduler };
