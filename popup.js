document.addEventListener('DOMContentLoaded', () => {
  const currencySelect = document.getElementById('currency-select');
  const displayModeSelect = document.getElementById('display-mode');
  const extensionEnabledCheckbox = document.getElementById('extension-enabled');

  // Load saved settings
  chrome.storage.local.get(['targetCurrency', 'displayMode', 'extensionEnabled'], (result) => {
    if (result.targetCurrency) {
      currencySelect.value = result.targetCurrency;
    }
    if (result.displayMode) {
      displayModeSelect.value = result.displayMode;
    }
    // Default to enabled if not set
    if (result.extensionEnabled !== undefined) {
      extensionEnabledCheckbox.checked = result.extensionEnabled;
    }
  });

  // Save currency selection
  currencySelect.addEventListener('change', () => {
    chrome.storage.local.set({ targetCurrency: currencySelect.value });
  });

  // Save display mode
  displayModeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ displayMode: displayModeSelect.value });
  });

  // Save enabled state
  extensionEnabledCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ extensionEnabled: extensionEnabledCheckbox.checked });
  });
});