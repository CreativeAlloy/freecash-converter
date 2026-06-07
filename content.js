// Currency configuration with symbols and fallback rates
const currencyConfig = {
  EUR: {
    symbol: '€',
    fallbackRate: 0.87
  },
  GBP: {
    symbol: '£',
    fallbackRate: 0.79
  },
  ILS: {
    symbol: '₪',
    fallbackRate: 3.65
  },
  INR: {
    symbol: '₹',
    fallbackRate: 83.00
  },
  CAD: {
    symbol: 'C$',
    fallbackRate: 1.36
  },
  AUD: {
    symbol: 'A$',
    fallbackRate: 1.50
  },
  CHF: {
    symbol: 'CHF',
    fallbackRate: 0.88
  },
  BRL: {
    symbol: 'R$',
    fallbackRate: 4.95
  },
  ALL: {
    symbol: 'L',
    fallbackRate: 98.00
  },
  CZK: {
    symbol: 'Kč',
    fallbackRate: 24.00
  },
  ARS: {
    symbol: 'ARS$',
    fallbackRate: 835.00
  },
  TWD: {
    symbol: 'NT$',
    fallbackRate: 32.00
  },
  UAH: {
    symbol: '₴',
    fallbackRate: 40.00
  },
  DKK: {
    symbol: 'kr',
    fallbackRate: 6.70
  },
  GEL: {
    symbol: '₾',
    fallbackRate: 2.65
  },
  MAD: {
    symbol: 'DH',
    fallbackRate: 9.90
  },
  AED: {
    symbol: 'AED',
    fallbackRate: 3.67
  },
  SAR: {
    symbol: 'SR',
    fallbackRate: 3.75
  }
};

let targetCurrency = 'EUR';
let conversionRate = currencyConfig.EUR.fallbackRate;
let rateFetched = false;
let extensionEnabled = true;
let displayMode = 'parentheses'; // 'replace' or 'parentheses'

// 1. Get target currency from storage and fetch live rate
async function initializeConverter() {
  try {
    // Get target currency from storage (default to EUR)
    const result = await chrome.storage.local.get(['targetCurrency', 'displayMode', 'extensionEnabled']);
    targetCurrency = result.targetCurrency || 'EUR';
    displayMode = result.displayMode || 'parentheses';
    extensionEnabled = result.extensionEnabled !== false; // Default to enabled
    
    // Validate currency is in our config
    if (!currencyConfig[targetCurrency]) {
      console.warn(`[Freecash Converter] Unknown currency ${targetCurrency}, falling back to EUR`);
      targetCurrency = 'EUR';
    }
    
    console.log(`[Freecash Converter] Using target currency: ${targetCurrency}`);
    
    // Fetch live rate from background service worker
    await fetchLiveRateFromBackground();
  } catch (error) {
    console.error('[Freecash Converter] Error initializing converter:', error);
    targetCurrency = 'EUR';
    conversionRate = currencyConfig.EUR.fallbackRate;
  }
}

async function fetchLiveRateFromBackground() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'fetchRate', currency: targetCurrency },
      (response) => {
        if (response && response.success) {
          conversionRate = response.rate;
          rateFetched = true;
          console.log(`[Freecash Converter] Live rate fetched: 1 USD = ${conversionRate} ${targetCurrency}`);
        } else {
          conversionRate = currencyConfig[targetCurrency].fallbackRate;
          console.log(`[Freecash Converter] Using fallback rate: 1 USD = ${conversionRate} ${targetCurrency}`);
        }
        resolve();
      }
    );
  });
}

// 2. Deep text-node scanner and converter
function convertPricesOnPage(element = document.body) {
  // Skip if extension is disabled
  if (!extensionEnabled) {
    console.log('[Freecash Converter] Extension is disabled, skipping conversion');
    return;
  }
  
  // Regex to match things like $5.14, $105.50, $ 0.46, $530.91, etc.
  // It handles optional spaces after the $ symbol and commas in large numbers.
  const priceRegex = /\$\s*([0-9,]+\.?[0-9]*)/g;

  // Use a TreeWalker to efficiently find all raw text blocks on the page
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip script, style, and input elements to prevent breaking page functionality
        const parentTag = node.parentElement ? node.parentElement.tagName : '';
        if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(parentTag)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Skip text nodes inside chakra-text elements (they'll be handled by chakra overlay logic)
        let parent = node.parentElement;
        while (parent) {
          if (parent.classList && Array.from(parent.classList).some(cls => cls.includes('chakra-text'))) {
            return NodeFilter.FILTER_REJECT;
          }
          parent = parent.parentElement;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const currencySymbol = currencyConfig[targetCurrency].symbol;

  let textNode;
  while ((textNode = walker.nextNode())) {
    const originalText = textNode.nodeValue;

    if (priceRegex.test(originalText)) {
      // Reset regex index before replacing
      priceRegex.lastIndex = 0; 

      if (displayMode === 'replace') {
        // Replace mode: replace original text with converted value
        const newText = originalText.replace(priceRegex, (match, p1) => {
          // Strip out commas for calculations (e.g., "1,000.00" -> "1000.00")
          const cleanNum = parseFloat(p1.replace(/,/g, ''));
          
          if (!isNaN(cleanNum)) {
            const converted = cleanNum * conversionRate;
            
            // Determine how many decimal places to keep based on original input
            let formattedNum;
            if (p1.includes('.')) {
              formattedNum = converted.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            } else {
              formattedNum = Math.round(converted).toLocaleString();
            }
            
            return `${currencySymbol}${formattedNum}`;
          }
          return match; // Return unchanged if parse fails
        });

        // Update the node text if a change happened
        if (newText !== originalText) {
          textNode.nodeValue = newText;
        }
      } else {
        // Parentheses mode: add converted value after original in parentheses
        // Check if already has parentheses conversion appended
        if (!originalText.includes(`(${currencySymbol}`)) {
          let appendText = '';
          priceRegex.lastIndex = 0;
          
          originalText.replace(priceRegex, (match, p1) => {
            const cleanNum = parseFloat(p1.replace(/,/g, ''));
            
            if (!isNaN(cleanNum)) {
              const converted = cleanNum * conversionRate;
              
              let formattedNum;
              if (p1.includes('.')) {
                formattedNum = converted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
              } else {
                formattedNum = Math.round(converted).toLocaleString();
              }
              
              appendText = ` (${currencySymbol}${formattedNum})`;
            }
            return match;
          });
          
          if (appendText) {
            textNode.nodeValue = originalText + appendText;
          }
        }
      }
    }
  }

  // Specifically handle Chakra UI text elements with pattern chakra-text fc-*
  const chakraElements = element.querySelectorAll('[class*="chakra-text"][class*="fc-"]');
  chakraElements.forEach(chakraEl => {
    // Regex to match things like $5.14, $105.50, $ 0.46, $530.91, etc.
    priceRegex.lastIndex = 0;
    const originalText = chakraEl.textContent;
    
    if (priceRegex.test(originalText)) {
      priceRegex.lastIndex = 0;
      
      // Extract and convert the price
      let convertedText = '';
      originalText.replace(priceRegex, (match, p1) => {
        const cleanNum = parseFloat(p1.replace(/,/g, ''));
        
        if (!isNaN(cleanNum)) {
          const converted = cleanNum * conversionRate;
          
          let formattedNum;
          if (p1.includes('.')) {
            formattedNum = converted.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          } else {
            formattedNum = Math.round(converted).toLocaleString();
          }
          
          convertedText = `${currencySymbol}${formattedNum}`;
        }
        return match;
      });
      
      // Check if this is the lottery chakra (fc-ffrnu2) - not dynamic, replace text directly
      const isLotteryChakra = chakraEl.classList.toString().includes('fc-ffrnu2'); // This class is only used for the Lottery Reward card in My Offers
      
      // Check if this is a display-mode chakra (applies display mode setting instead of overlay)
      const displayModeChakras = [
        'fc-dxjui9',
        'fc-15zum9u', // This class holds the value of individual rewards for each milestone in an offer (My Offers page > Main Rewards)
        'fc-cbiyc9',
        'fc-1peqqr2',
        'fc-1cyy9q5',
        'fc-gltlbi',
        'fc-mj829',
        'fc-wfh8u6',
        'fc-4sd3b',
        'fc-10wp6bm',
        'fc-1e9qgxv',
        'fc-1q5d9ro', 
        'fc-cv7t3j',
        'fc-nwsrl7',
        // 'fc-1jh1nzt' // This class is used for the reward of the current offer selected in My Offers, commented out because adding it here glitches the page.
      ]; // God fucking help me with these obfuscated class names
      const isDisplayModeChakra = displayModeChakras.some(cls => chakraEl.classList.toString().includes(cls));
      
      // Check if this is an exception to ignore entirely
      const isExceptionToHide = [ // I am breaking these down into multiple lines because I want to at least be able to label what each obfuscated class is for
        'fc-98dyva',
        'fc-31ne59',
        'fc-puk5iu',
        'fc-4sd3b',
        'fc-1ksqa92',
      ];
      if (isExceptionToHide.some(cls => chakraEl.classList.toString().includes(cls))) {
        return; // Skip this element entirely
      }
      
      // Special case: fc-w2pqmz should only be hidden if it's a child of fc-7gkp5u - this class holds seemingly all elements that display cashout exchange rates, crypto fees where applicable, etc. Converted values look broken on these screens anyway. Maybe I might fix this in the future if I want to
      if (chakraEl.classList.toString().includes('fc-w2pqmz')) {
        let parentElement = chakraEl.parentElement;
        let hasParentClass = false;
        while (parentElement) {
          if (parentElement.classList && parentElement.classList.contains('fc-7gkp5u')) {
            hasParentClass = true;
            break;
          }
          parentElement = parentElement.parentElement;
        }
        if (hasParentClass) {
          return; // Skip this element if it's a child of fc-7gkp5u
        }
      }
      
      // Check if inside onboarding-offer-task div - skip overlay for these
      let parent = chakraEl.parentElement;
      let isInsideOnboardingTask = false;
      while (parent) {
        if (parent.classList && parent.classList.contains('onboarding-offer-task')) {
          isInsideOnboardingTask = true;
          break;
        }
        parent = parent.parentElement;
      }
      
      if (isLotteryChakra) {
        // For lottery chakras, store original USD-only text to prevent duplication on each click
        if (!chakraEl.dataset.originalUsdOnly) {
          chakraEl.dataset.originalUsdOnly = originalText;
        }
        // Always use the stored original text
        const usdOnly = chakraEl.dataset.originalUsdOnly;
        chakraEl.textContent = `${usdOnly} (${convertedText})`;
      } else if (isDisplayModeChakra) {
        // For display-mode chakras, apply display mode setting
        // Store original text on first conversion to prevent duplication on clicks
        if (!chakraEl.dataset.originalTextContent) {
          chakraEl.dataset.originalTextContent = originalText;
        }
        const sourceText = chakraEl.dataset.originalTextContent;
        
        if (displayMode === 'replace') {
          // Replace mode: replace USD prices with converted values
          priceRegex.lastIndex = 0;
          const newText = sourceText.replace(priceRegex, (match, p1) => {
            const cleanNum = parseFloat(p1.replace(/,/g, ''));
            if (!isNaN(cleanNum)) {
              const converted = cleanNum * conversionRate;
              let formattedNum;
              if (p1.includes('.')) {
                formattedNum = converted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
              } else {
                formattedNum = Math.round(converted).toLocaleString();
              }
              return `${currencySymbol}${formattedNum}`;
            }
            return match;
          });
          chakraEl.textContent = newText;
        } else {
          // Parentheses mode: show both USD and converted
          priceRegex.lastIndex = 0;
          const newText = sourceText.replace(priceRegex, (match, p1) => {
            const cleanNum = parseFloat(p1.replace(/,/g, ''));
            if (!isNaN(cleanNum)) {
              const converted = cleanNum * conversionRate;
              let formattedNum;
              if (p1.includes('.')) {
                formattedNum = converted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
              } else {
                formattedNum = Math.round(converted).toLocaleString();
              }
              return `${match} (${currencySymbol}${formattedNum})`;
            }
            return match;
          });
          chakraEl.textContent = newText;
        }
      } else if (!isInsideOnboardingTask && !isDisplayModeChakra) {
        // For other dynamic chakras (not in onboarding-offer-task), create overlay
        let overlay = chakraEl.nextElementSibling;
        if (!overlay || !overlay.classList.contains('freecash-converter-overlay')) {
          overlay = document.createElement('span');
          overlay.classList.add('freecash-converter-overlay');
          overlay.style.color = 'inherit';
          overlay.style.fontWeight = 'inherit';
          chakraEl.parentNode.insertBefore(overlay, chakraEl.nextSibling);
        }
        
        if (convertedText) {
          overlay.textContent = ` (${convertedText})`;
        }
      }
      // If inside onboarding-offer-task, skip - text node conversions already handle it
    }
  });
}

// 3. Orchestration
let clickTimeout; // Declare at module level for persistence

async function init() {
  await initializeConverter();
  
  // Run initially on whole page
  convertPricesOnPage();

  // Watch for dynamic infinite scroll or new offers loading
  const observer = new MutationObserver((mutations) => {
    // Disconnect temporarily to avoid infinite loops when writing back text changes
    observer.disconnect();

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          convertPricesOnPage(node);
        }
      });
    });

    // Re-observe after modifications
    startObserving();
  });

  function startObserving() {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  startObserving();

  // Handle dynamically updated chakra elements on click
  document.addEventListener('click', (event) => {
    console.log('[Freecash Converter] Click detected:', event.target);
    
    // Clear existing timeout if user clicks again quickly
    if (clickTimeout) clearTimeout(clickTimeout);
    
    // Re-convert chakra elements after 0.5s to catch dynamically updated prices
    clickTimeout = setTimeout(() => {
      console.log('[Freecash Converter] Running price conversion after click');
      convertPricesOnPage(document.body);
    }, 500);
  }, true); // Use capture phase to catch all clicks

  // Listen for storage changes (when popup settings change)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.displayMode) {
        displayMode = changes.displayMode.newValue;
        console.log(`[Freecash Converter] Display mode changed to: ${displayMode}`);
      }
      if (changes.extensionEnabled !== undefined) {
        extensionEnabled = changes.extensionEnabled.newValue;
        console.log(`[Freecash Converter] Extension ${extensionEnabled ? 'enabled' : 'disabled'}`);
      }
    }
  });
}

init();