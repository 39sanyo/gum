// Fake doll listing site for testing a scraper.
// Run: node fake-doll-site.js   (then open http://localhost:4000)

const http = require('http');

const PORT = process.env.PORT || 4000;
const PAGE_SIZE = 6;

const seed = () => [
  { id: 1, name: 'Vintage Porcelain Victorian Doll', price: 45.0 },
  { id: 2, name: 'Handmade Rag Doll Rosie', price: 18.5 },
  { id: 3, name: 'Antique Bisque Baby Doll', price: 120.0 },
  { id: 4, name: 'Blythe Style Custom Doll', price: 89.99 },
  { id: 5, name: 'Retro 1960s Fashion Doll', price: 35.0 },
  { id: 6, name: 'Gothic Ball-Jointed Doll', price: 210.0 },
  { id: 7, name: 'Knitted Amigurumi Doll', price: 22.0 },
  { id: 8, name: 'Collectible Kokeshi Doll', price: 28.75 },
  { id: 9, name: 'Wooden Matryoshka Set (5pc)', price: 40.0 },
  { id: 10, name: 'Clown Doll, Creepy Edition', price: 15.0 },
  { id: 11, name: 'Reborn Newborn Doll', price: 150.0 },
  { id: 12, name: 'Steampunk Automaton Doll', price: 95.0 },
];

let dolls = seed();
let nextId = 13;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Number(n).toFixed(2);

const layout = (title, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: #222; }
    header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #eee; margin-bottom: 1rem; }
    .doll-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
    .doll-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    .doll-card h2 { font-size: 1rem; margin: 0 0 .5rem; }
    .doll-price { font-weight: bold; color: #0a7a3d; }
    .pagination { margin: 1.5rem 0; display: flex; gap: 1rem; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border-bottom: 1px solid #eee; padding: .4rem; text-align: left; }
    form.inline { display: inline; }
    input { padding: .3rem; }
  </style>
</head>
<body>
  <header><h1><a href="/" style="text-decoration:none;color:inherit">Fake Doll Emporium</a></h1><a href="/admin">admin</a></header>
  ${body}
</body>
</html>`;

const listingPage = (page) => {
  const totalPages = Math.max(1, Math.ceil(dolls.length / PAGE_SIZE));
  page = Math.min(Math.max(1, page), totalPages);
  const slice = dolls.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cards = slice
    .map(
      (d) => `
    <article class="doll-card" data-id="${d.id}">
      <a class="doll-link" href="/doll/${d.id}"><h2 class="doll-name">${esc(d.name)}</h2></a>
      <span class="doll-price">${money(d.price)}</span>
    </article>`
    )
    .join('');

  const nav = `
    <nav class="pagination">
      ${page > 1 ? `<a class="prev" href="/?page=${page - 1}">&larr; Prev</a>` : ''}
      <span>Page ${page} of ${totalPages}</span>
      ${page < totalPages ? `<a class="next" href="/?page=${page + 1}">Next &rarr;</a>` : ''}
    </nav>`;

  return layout('Dolls for sale', `<div class="doll-grid">${cards}</div>${nav}`);
};

const detailPage = (d) =>
  layout(
    d.name,
    `<article class="doll-detail" data-id="${d.id}">
      <h1 class="doll-name">${esc(d.name)}</h1>
      <p class="doll-price">${money(d.price)}</p>
      <p class="doll-description">A lovely doll in good condition. Listing #${d.id}.</p>
      <a href="/">&larr; Back to listings</a>
    </article>`
  );

const adminPage = () => {
  const rows = dolls
    .map(
      (d) => `
    <tr>
      <td>${d.id}</td>
      <td>${esc(d.name)}</td>
      <td>
        <form class="inline" method="post" action="/admin/price">
          <input type="hidden" name="id" value="${d.id}">
          <input name="price" value="${d.price.toFixed(2)}" size="8">
          <button>Set price</button>
        </form>
      </td>
      <td>
        <form class="inline" method="post" action="/admin/remove">
          <input type="hidden" name="id" value="${d.id}">
          <button>Remove</button>
        </form>
      </td>
    </tr>`
    )
    .join('');

  return layout(
    'Admin',
    `<h2>Admin</h2>
    <p>
      <form class="inline" method="post" action="/admin/shuffle"><button>Randomly change 3 prices</button></form>
      <form class="inline" method="post" action="/admin/reset"><button>Reset to defaults</button></form>
    </p>
    <h3>Add a listing</h3>
    <form method="post" action="/admin/add">
      <input name="name" placeholder="Name" required>
      <input name="price" placeholder="Price" size="8" required>
      <button>Add</button>
    </form>
    <h3>Listings</h3>
    <table><tr><th>ID</th><th>Name</th><th>Price</th><th></th></tr>${rows}</table>`
  );
};

const readForm = (req) =>
  new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(data))));
  });

const send = (res, status, body, type = 'text/html; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
};
const redirect = (res, to) => {
  res.writeHead(303, { Location: to });
  res.end();
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (req.method === 'GET') {
    if (path === '/') return send(res, 200, listingPage(parseInt(url.searchParams.get('page'), 10) || 1));

    const m = path.match(/^\/doll\/(\d+)$/);
    if (m) {
      const d = dolls.find((x) => x.id === Number(m[1]));
      return d ? send(res, 200, detailPage(d)) : send(res, 404, layout('Not found', '<h2>Doll not found</h2>'));
    }

    if (path === '/api/dolls') return send(res, 200, JSON.stringify(dolls, null, 2), 'application/json');
    if (path === '/admin') return send(res, 200, adminPage());
    return send(res, 404, layout('Not found', '<h2>404</h2>'));
  }

  if (req.method === 'POST' && path.startsWith('/admin/')) {
    const form = await readForm(req);

    if (path === '/admin/price') {
      const d = dolls.find((x) => x.id === Number(form.id));
      const price = parseFloat(form.price);
      if (d && !Number.isNaN(price)) d.price = price;
    } else if (path === '/admin/add') {
      const price = parseFloat(form.price);
      if (form.name && !Number.isNaN(price)) dolls.push({ id: nextId++, name: form.name, price });
    } else if (path === '/admin/remove') {
      dolls = dolls.filter((x) => x.id !== Number(form.id));
    } else if (path === '/admin/shuffle') {
      [...dolls]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .forEach((d) => {
          const factor = 0.7 + Math.random() * 0.6; // -30% to +30%
          d.price = Math.round(d.price * factor * 100) / 100;
        });
    } else if (path === '/admin/reset') {
      dolls = seed();
      nextId = 13;
    }
    return redirect(res, '/admin');
  }

  send(res, 405, 'Method not allowed', 'text/plain');
});

server.listen(PORT, () => {
  console.log(`Fake doll site running at http://localhost:${PORT}`);
  console.log(`  Listings: http://localhost:${PORT}/`);
  console.log(`  Admin:    http://localhost:${PORT}/admin`);
  console.log(`  JSON:     http://localhost:${PORT}/api/dolls`);
});
