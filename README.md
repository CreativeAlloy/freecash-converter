# Freecash Multi-Currency Converter (FMCC)
[Freecash](https://freecash.com/en) is an online Get-Paid-To platform *(a.k.a. GPT platforms)* which requires users to complete various tasks in order to obtain monetary rewards. Tasks include filling surveys, doing quizzes, and most prominently testing mobile games.

Because Freecash utilizes the American Dollar (USD) as its default currency, anyone living in a different region constantly has to perform manual conversions in order to better understand what they are actually gaining in their own currency.

As I currently live within the European Union, I have no use for USD, hence my need to convert to EUR.

**Freecash Multi-Currency Converter** automates this process by displaying your desired currency instead of USD directly on all Freecash pages. I've ***tried my bloody best*** to account for all bizarre edge cases, but if you find any bugs, please create an issue and describe in detail what has gone wrong.

## How Conversion Works
The conversion process uses the [Wise Currency Converter](https://wise.com/gb/currency-converter/) in the backend in order to pull the latest conversion rates for all supported currencies. In case of any issues, the JavaScript logic should fall back to default value presets.

**These conversions are for reference only.** These are not your guaranteed earnings down to the cent, because the converter does not take into account conversion fees, transaction fees, taxation, and so on. **By using this Chrome extension, you confirm that you are aware the displayed values are references.**

## Open-Source Contributions
Because of the nature of this project as open-source software (in lieu of being published on the Chrome Web Store), public contributors may create pull requests in order to introduce changes, which I will review myself.

For example, if you wish to add a new supported currency, you may edit the `background.js` file and copy the Regex logic. Using `GBP` for demonstration:
```js
const currencyConfig = {
    EUR: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*EUR/i, fallbackRate: 0.87 },
    /* Inside the rateRegex part, you only need to swap out EUR for GBP, and include the appropriate fallbackRate value, which you can find online */
    GBP: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*GBP/i, fallbackRate: 0.79 }
    // (And so on...)
}
```

## How to Install FMCC (Windows 10 & 11)
### Step 1: Cloning the Repository
The installation process is simple. Create a new folder anywhere on your computer - such as your desktop. In your file explorer, press the directory tab, write `cmd`, and press Enter.

Alternatively, you may use the Command Prompt directly with `cd C:\Users\NAME\Desktop\FOLDERNAME` if your folder is on your Desktop, and you don't have any of that OneDrive nonsense working in the background.

Once you are operating within that newly created folder, run the following commands in Command Prompt:
```batch
:: Clone the repository into your folder
git clone https://github.com/CreativeAlloy/freecash-converter.git .

:: Note: The dot (.) at the end forces it to clone right into your current folder 
:: instead of creating another subfolder. It keeps things neat.
```
If you don't feel comfortable using the command prompt, simply [download the Freecash Converter Installer script](https://github.com/CreativeAlloy/freecash-converter/releases/tag/1.0.0.1), place it anywhere you would like, and run it. It will automatically detect if the active folder is empty or full of files, and in case of the latter, a new compartmentalized folder will be created to avoid shuffling your existing files around.

### Step 2: Adding the Extension to Google Chrome
To do this, follow the instructions below:
1. Open Google Chrome, and type `chrome://extensions/` in the address bar.
2. Look in the top-right corner and turn on the **Developer Mode** toggle. If you don't see it, ensure Chrome is up-to-date.
3. Click the **Load unpacked** button that appears in the top-left corner.
4. Select **the folder** where you just cloned the repository.

This essentially installs the extension to Google Chrome for you. From this point forward, you can begin using it.

## Updating FMCC
I have made updating FMCC an even easier affair than installing it:
1. Locate the folder where you have cloned the repository.
2. Run `update.bat`.
3. Restart Google Chrome, **OR if you have unsaved work,** go to `chrome://extensions/` and press the Update button, or the button that looks like a Refresh arrow.

## Supporting My Work
My name is Sufian "CreativeAlloy" M'Barki, and you may know me from [The Wasp Alloy](https://thewaspalloy.org/), my [YouTube Channel](https://www.youtube.com/@CreativeAlloyYT), or perhaps [Suno](https://suno.com/@creativealloy).

Regardless, if you would like to support my work, please consider tipping me on my [Ko-fi Page](https://ko-fi.com/creativealloy). I accept both fiat (real currencies) and cryptocurrencies through crypto wallet transactions. I've listed the cryptocurrencies I accept on the page itself.

Thank you!