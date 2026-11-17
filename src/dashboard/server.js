// Price history dashboard.

const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const PORT = process.env.DASHBOARD_PORT || 5050;

// Same file the bot uses (src/dashboard -> project root -> data/bot.db). Read-only so it can't change anything.
const db = new Database(path.join(__dirname, '../../data/bot.db'), {
  readonly: true,
  fileMustExist: true,
  timeout: 5000,
});

// Finds the timestamp column in price_history_master whatever it's called (recorded_at, created_at, ...)
const tsKey = (row) => Object.keys(row).find((k) => /time|date|recorded|created|at$/i.test(k));

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/history', (req, res) => {
  try {
    const dolls = db
      .prepare('SELECT doll_id, name, listing_url, current_price FROM doll_master ORDER BY name')
      .all();
    const historyStmt = db.prepare('SELECT * FROM price_history_master WHERE doll_id = ? ORDER BY rowid');

    res.json(
      dolls.map((d) => ({
        id: d.doll_id,
        name: d.name,
        url: d.listing_url,
        currentPrice: d.current_price,
        history: historyStmt.all(d.doll_id).map((row) => ({ t: row[tsKey(row)], price: row.price })),
      }))
    );
  } catch (err) {
    console.error('[dashboard]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`[dashboard] http://localhost:${PORT}`));
