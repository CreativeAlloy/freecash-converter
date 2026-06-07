// Currency configuration (same as in content.js for reference)
const currencyConfig = {
  EUR: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*EUR/i, fallbackRate: 0.87 },
  GBP: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*GBP/i, fallbackRate: 0.79 },
  ILS: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*ILS/i, fallbackRate: 3.65 },
  INR: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*INR/i, fallbackRate: 83.00 },
  CAD: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*CAD/i, fallbackRate: 1.36 },
  AUD: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*AUD/i, fallbackRate: 1.50 },
  CHF: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*CHF/i, fallbackRate: 0.88 },
  BRL: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*BRL/i, fallbackRate: 4.95 },
  ALL: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*ALL/i, fallbackRate: 98.00 },
  CZK: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*CZK/i, fallbackRate: 24.00 },
  ARS: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*ARS/i, fallbackRate: 835.00 },
  TWD: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*TWD/i, fallbackRate: 32.00 },
  UAH: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*UAH/i, fallbackRate: 40.00 },
  DKK: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*DKK/i, fallbackRate: 6.70 },
  GEL: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*GEL/i, fallbackRate: 2.65 },
  MAD: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*MAD/i, fallbackRate: 9.90 },
  AED: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*AED/i, fallbackRate: 3.67 },
  SAR: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*SAR/i, fallbackRate: 3.75 }
};

// Service worker message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchRate') {
    fetchLiveRate(request.currency)
      .then(rate => sendResponse({ success: true, rate }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function fetchLiveRate(targetCurrency) {
  const wiseUrl = `https://wise.com/gb/currency-converter/usd-to-${targetCurrency.toLowerCase()}-rate`;
  const config = currencyConfig[targetCurrency];
  
  if (!config) {
    throw new Error(`Unknown currency: ${targetCurrency}`);
  }

  try {
    const response = await fetch(wiseUrl);
    const htmlText = await response.text();
    const match = htmlText.match(config.rateRegex);
    
    if (match && match[1]) {
      const rate = parseFloat(match[1]);
      console.log(`[Freecash Converter] Live rate fetched: 1 USD = ${rate} ${targetCurrency}`);
      return rate;
    } else {
      console.warn(`[Freecash Converter] Could not find rate pattern for ${targetCurrency}. Using fallback.`);
      return config.fallbackRate;
    }
  } catch (error) {
    console.warn(`[Freecash Converter] Failed to fetch rate for ${targetCurrency}: ${error.message}. Using fallback.`);
    return config.fallbackRate;
  }
}
