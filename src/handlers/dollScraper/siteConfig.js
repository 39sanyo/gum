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

    
// Local site for testing purposes.
    'localhost:4000': {
        elementSelector: '.doll-detail',
        priceElementSelector: '.doll-price',
    },

    'fake.apdb.world': {
        elementSelector: '.doll-detail',
        priceElementSelector: '.doll-price',
    },
};

module.exports = { siteConfigs };
