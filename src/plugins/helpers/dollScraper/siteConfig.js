const siteConfigs = {
    'jiwudoc.myshopify.com': {
        elementSelector: '.price__container',
        priceElementSelector: '.price-item--regular .etrans-money',
    },
    'dollyteria.com': {
        elementSelector: '',
        priceElementSelector: 'meta[property="product:price:amount"]',
    },
    'mandarake.co.jp': {
        elementSelector: '.basicinfo',
        priceElementSelector: '.shohin_price.__price',
    },
    'volksusa.store': {
        elementSelector: '.product-pricing',
        priceElementSelector: '.money',
    },
    'azone-int.co.jp': {
        elementSelector: '.cct203_item2',
        priceElementSelector: 'table tr:nth-child(3) td'
    },
    'fromjapan.co.jp': {
        elementSelector: '.inline-flex.flex-wrap.items-center.leading-tight',
        priceElementSelector: '.text-2xl'
    },
};

module.exports = { siteConfigs };
