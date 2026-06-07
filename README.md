# Freecash Multi-Currency Converter (FMCC)
Freecash is an online Get-Paid-To platform *(a.k.a. GPT platforms)* which requires users to complete various tasks in order to obtain monetary rewards.

Because Freecash utilizes the American Dollar (USD) as its default currency, anyone living in a different region constantly has to perform manual conversions in order to better understand what they are actually gaining in their own currency.

As I currently live within the European Union, I have no use for USD, hence my need to convert to EUR.

## How Conversion Works
The conversion process uses the [Wise Currency Converter](https://wise.com/gb/currency-converter/) in the backend in order to pull the latest conversion rates for all supported currencies. In case of any issues, the JavaScript logic should fall back to default value presets.

**These conversions are for reference only.** These are not your guaranteed earnings down to the cent, because the converter does not take into account conversion fees, transaction fees, taxation, and so on. **By using this Chrome extension, you confirm that you are aware the displayed values are references.**

## Open-Source Contributions
Because of the nature of this project as open-source software (in lieu of being published on the Chrome Web Store), public contributors may create pull requests in order to introduce changes, which I will review myself.

For example, if you wish to add a new supported currency, you may edit the `background.js` file and copy the Rejex logic. Using `GBP` for demonstration:
```js
const currencyConfig = {
    EUR: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*EUR/i, fallbackRate: 0.87 },
    /* Inside the rateRegex part, you only need to swap out EUR for GBP, and include the appropriate fallbackRate value, which you can find online */
    GBP: { rateRegex: /1\s*USD\s*=\s*([\d.]+)\s*GBP/i, fallbackRate: 0.79 }
    // (And so on...)
}
```

## How To Install FMCC (Windows 10 & 11)
The installation process is simple. Create a new folder anywhere on your computer - such as your desktop. In your file explorer, press the directory tab, write `cmd`, and press Enter.

Alternatively, you may use the Command Prompt directly with `cd C:\Users\NAME\Desktop\FOLDERNAME` if your folder is on your Desktop, and you don't have any of that OneDrive nonsense working in the background.

Once you are operating within that newly created folder, run the following commands in Command Prompt:
```batch
:: Clone the repository into your folder
git clone https://github.com/CreativeAlloy/freecash-converter.git .

:: Note: The dot (.) at the end forces it to clone right into your current folder 
:: instead of creating another subfolder. It keeps things neat.
```

If you don't feel comfortable using the command prompt, simply download the Freecash Converter Installer script.