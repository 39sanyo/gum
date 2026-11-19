const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../data/bot.db'));
db.pragma('foreign_keys = ON');

// 1. Prepare statements
const findDollStmt = db.prepare('SELECT doll_id, current_price FROM doll_master WHERE listing_url = ?');

const insertDollStmt = db.prepare(`
  INSERT INTO doll_master (name, listing_url,current_price)
  VALUES (@name, @listing_url, @price)
`);

const updateDollStmt = db.prepare(`
  UPDATE doll_master
  SET current_price = @price, last_updated = CURRENT_TIMESTAMP
  WHERE doll_id = @doll_id
`);

const insertHistoryStmt = db.prepare(`
  INSERT INTO price_history_master(doll_id, price)
  VALUES (@doll_id, @price)
`);

const findDollFullByUrlStmt = db.prepare(`
  SELECT doll_id, name, listing_url, current_price, last_updated
  FROM doll_master WHERE listing_url = ?
`);


const findDollByIdStmt = db.prepare('SELECT doll_id, name FROM doll_master WHERE doll_id = ?');
const removeHistoryStmt = db.prepare('DELETE FROM price_history_master WHERE doll_id = ?');
const removeDollStmt = db.prepare('DELETE FROM doll_master WHERE doll_id = ?');
const getAllDollsStmt = db.prepare('SELECT doll_id, name, listing_url FROM doll_master');

// 2. Transaction to handle new listings, price changes, and unchanged prices
const insertDollMaster = db.transaction((listing) => {
  const existingDoll = findDollStmt.get(listing.listing_url);

  if (!existingDoll) {
    const info = insertDollStmt.run(listing);
    const newDollId = info.lastInsertRowid;

    insertHistoryStmt.run({ doll_id: newDollId, price: listing.price });
    console.log(`[NEW] "${listing.name}" saved at $${listing.price}`);
    return {
      status: 'NEW',
      label: `New listing tracked at $${listing.price}`
    };
  }

  if (existingDoll.current_price !== listing.price) {
    const oldPrice = existingDoll.current_price;
    updateDollStmt.run({ doll_id: existingDoll.doll_id, price: listing.price });
    insertHistoryStmt.run({ doll_id: existingDoll.doll_id, price: listing.price });

    console.log(`[UPDATED] "${listing.name}": $${oldPrice} -> $${listing.price}`);
    return {
      status: 'UPDATED',
      label: `Price changed: $${oldPrice} → $${listing.price}`,
      doll: {
        name: listing.name,
        url: listing.listing_url,
        oldPrice,
        newPrice: listing.price,
      },
    };
  }

  console.log(`[UNCHANGED] "${listing.name}" is still $${listing.price}`);
  return {
    status: 'UNCHANGED',
    label: `No price change (still $${listing.price})`
  };
});

const removeDoll = db.transaction((dollId) => {
    const doll = findDollByIdStmt.get(dollId);

    if (!doll) {
        return{ status: 'NOT_FOUND', label: `No Doll found with ID ${dollId}`}
    }

    const historyInfo = removeHistoryStmt.run(dollId);
    removeDollStmt.run(dollId);

    console.log(`[REMOVED] "${doll.name}" (ID ${dollId}, and ${historyInfo.changes} price history rows)`);
    return {
        status: 'REMOVED',
        label: `Removed "${doll.name}"`,
        doll: { id: dollId, name:doll.name },
    }
})


const getAllDolls = () => getAllDollsStmt.all();
const getDollByUrl = (url) => findDollFullByUrlStmt.get(url);

module.exports = { insertDollMaster, getAllDolls, getDollByUrl, removeDoll };
