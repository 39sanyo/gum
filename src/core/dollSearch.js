const { scraper } = require ('./scraper.js')
const { siteConfigs } =  require('../siteConfig.jsteConfig.js');

const dollSearch = async (rawInput) => {
    const matchedDomain = Object.keys(siteConfigs).find((domain) => rawInput.includes(domain));

    if (!matchedDomain) {
        throw new Error('URL Is not supported');
    }

    const { elementSelector, priceElementSelector } = siteConfigs[matchedDomain];
    const finder = await scraper(rawInput, elementSelector, priceElementSelector);
    console.log(finder);
    return finder;
}

module.exports = { dollSearch };
