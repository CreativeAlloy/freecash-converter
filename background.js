chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchRate') {
    const currency = request.currency;
    const url = `https://wise.com/gb/currency-converter/usd-to-${currency.toLowerCase()}-rate`;

    fetch(url)
      .then(response => response.text())
      .then(htmlText => {
        // Dynamically construct a universal regex for the requested currency
        const rateRegex = new RegExp(`1\\s*USD\\s*=\\s*([\\d.]+)\\s*${currency}`, 'i');
        const match = htmlText.match(rateRegex);

        if (match && match[1]) {
          const rate = parseFloat(match[1]);
          console.log(`[Freecash Converter BG] Successfully fetched live rate for ${currency}: ${rate}`);
          sendResponse({ success: true, rate: rate });
        } else {
          console.warn(`[Freecash Converter BG] Regex match failed for ${currency} on Wise page`);
          sendResponse({ success: false });
        }
      })
      .catch(error => {
        console.error(`[Freecash Converter BG] Fetch error for ${currency}:`, error);
        sendResponse({ success: false });
      });

    return true; // Keep the message channel open for asynchronous sendResponse
  }
});