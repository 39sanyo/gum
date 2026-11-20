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
    'amiami.com': {
        elementSelector: null,
        priceElementSelector: '.item-detail__price_selling-price'
    },
    'jp.mercari.com': {
        elementSelector: null,
        priceElementSelector: '.jRCaEZ.iRYqgH'
    },
    'vinted.com': {
        elementSelector: null,
        priceElementSelector: '.u-text-left.m5odIW_price'
    },
    'buyee.jp': {
        elementSelector: null,
        priceElementSelector: '.small'
    },
    'rakuten.co.jp': {
        elementSelector: null,
        priceElementSelector: '.number--1Cmms.primary--2kjQA'
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
