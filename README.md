# नेपाली पात्रो · Nepali Patro

[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa)](https://www.nepalipatro.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://www.nepalipatro.app/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

> **नेपाली पात्रो** — A complete Nepali calendar and utility platform with 15+ tools including calendar, date converter, horoscope, weather, gold/silver rates, fuel prices, and kundali generator.

---

## 📖 Overview

**नेपाली पात्रो (Nepali Patro)** is a comprehensive, feature-rich web application designed for Nepali users worldwide. It combines traditional Nepali calendar functionality with modern utility tools — all in one place. The platform is built as a **Progressive Web App (PWA)**, meaning it can be installed on any device and works offline.

Whether you need to check today's Nepali date, convert between BS and AD, read your daily horoscope, check gold prices, or generate a birth chart, this platform has it all.

---

## ✨ Features

### 📅 Core Calendar
- **Nepali Calendar (BS 1975–2100)**: Full 150-year range (100 years back, 50 years forward)
- **Day-by-day view** with Tithi, English date, and festivals
- **Nepal Sambat (Newari Calendar)**: View dates in the Newari calendar system
- **Today's date** highlighted with quick navigation
- **Date selection sidebar** with event details
- **Interactive day click** with detailed information

### 🔄 Date Converters
- **BS ↔ AD Converter**: Convert between Nepali (Bikram Sambat) and English (Gregorian) dates
- **Date Difference Calculator**: Calculate days, weeks, months, years between two dates (supports both BS and AD)
- **Age Calculator**: Calculate age in years, months, days using AD or BS dates

### 🎉 Festivals & Holidays
- **Festival Grid**: Browse all Nepali festivals month-by-month with search functionality
- **Holiday Grid**: View public holidays, regional holidays, and restricted holidays
- **Upcoming Holidays**: Quick preview of upcoming holidays in the current month
- **Dual language search** (Nepali & English)
- **Festival count badges** for each month

### ✨ Astrology & Horoscope
- **Rashifal (Horoscope)**: Daily, weekly, and monthly horoscopes for all 12 zodiac signs
- **Kundali Generator**: Generate birth chart with Lagna, Rashi, Nakshatra, and planetary positions
- **PDF Export**: Download Kundali as a PDF file
- **Nepali & English language toggle**
- **Lucky number, color, and remedy** for each day/week/month

### 🌤️ Weather
- **Real-time weather** for 20+ Nepali cities using Open-Meteo API
- **7-day forecast** with temperature, humidity, wind speed
- **Sunrise and sunset** times
- Historical weather data (past 30 days)
- **Live API data** — no fake/demo data ever shown

### 💰 Financial Tools
- **Gold & Silver Rates**: Live prices per tola, 10g, and troy ounce (FENEGOSIDA rates)
- **Currency Exchange Rates**: Daily NRB rates for major currencies
- **Fuel Prices**: Nepal Oil Corporation (NOC) rates for petrol, diesel, kerosene, and LPG
- **Price change tracking** with visual indicators (📈 📉)

### 🛠️ Additional Tools
- **Nepali Unicode Converter**: Type Romanized Nepali and convert to Devanagari
- **Google Input Tools** suggestions for smart typing
- **Full typing guide** with shortcuts, examples, and quick reference
- **Download Google Input Tool** for Windows

### 📱 Progressive Web App (PWA)
- **Installable** on desktop and mobile devices
- **Offline support** with service worker caching
- **Native app-like experience**
- **Automatic updates** for cached content
- **Custom install banner** with fallback instructions
- **Navbar install button** for easy access

---

## 🚀 Live Demo

🌐 **Live URL:** [https://www.nepalipatro.com.np/](https://www.nepalipatro.app/)

---

## 📁 Project Structure

```
/
├── index.html                 # Main calendar page
├── calendar-2083.html         # Full calendar view
├── nepalsambat.html           # Nepal Sambat (Newari) calendar
├── unicode.html               # Nepali Unicode converter
├── dateconverter.html         # BS ↔ AD converter
├── date-difference.html       # Date difference calculator
├── age-calculator.html        # Age calculator (AD & BS)
├── festivals.html             # Festival grid
├── holidays.html              # Holiday grid
├── rashifal.html              # Horoscope (Rashifal)
├── weather.html               # Weather forecast
├── goldsilver.html            # Gold & Silver rates
├── kundali-generator.html     # Janam Kundali generator
├── exchange-rate.html         # Currency exchange rates
├── nepali_fuel_rates.html     # Fuel prices (NOC)
├── offline.html               # Offline fallback page
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker
├── pwa-install.js             # PWA installation script
├── screenshots/               # Screenshots folder
│   ├── calendar.png
│   ├── kundali.png
│   ├── rashifal.png
│   ├── weather.png
│   ├── gold.png
│   └── unicode.png
├── icons/                     # App icons
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── README.md                  # This file
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantic markup |
| **CSS3** | Custom styling with responsive design |
| **Vanilla JavaScript** | All logic, calculations, and interactivity |
| **Service Worker (SW)** | Offline support and caching |
| **PWA Manifest** | App installation and configuration |
| **Open-Meteo API** | Weather data |
| **Currency API** | Gold/silver rates and exchange rates |
| **Google Input Tools API** | Unicode transliteration suggestions |
| **html2pdf.js** | Kundali PDF generation |

### 📦 External Dependencies

```html
<!-- PDF Generation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
```

---

## 🚀 Installation

### Option 1: Clone the Repository

```bash
git clone https://github.com/yourusername/nepali-patro.git
cd nepali-patro
```

Then open `index.html` in your browser.

### Option 2: Download ZIP

1. Download the ZIP file from the repository
2. Extract to your web server directory
3. Access via your web server (or open `index.html` directly)

### Option 3: Deploy to Web Server

Upload all files to your web server root directory. The PWA will automatically work when accessed via HTTPS (or localhost).

---

## 📱 PWA Setup

The platform is fully configured as a Progressive Web App.

### Service Worker
The service worker (`sw.js`) is automatically registered when any page loads. It caches:
- All HTML pages
- CSS and JavaScript assets
- Manifest and offline page

### Installation Prompts
- **Desktop Chrome/Edge**: Native `beforeinstallprompt` event
- **Mobile Chrome**: Native install prompt
- **Other Browsers**: Custom fallback with instructions
- **Navbar "Install" button**: Always available for manual install

### PWA Meta Tags
Add these to every HTML page:

```html
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Nepali Patro">
<meta name="theme-color" content="#123b6d">
<meta name="mobile-web-app-capable" content="yes">
```

---

## 🌐 API Integrations

### 1. Weather (Open-Meteo)
**Endpoint:** `https://api.open-meteo.com/v1/forecast`

Supports:
- Current conditions (temperature, humidity, wind speed)
- 7-day forecast
- Historical data (past 30 days)
- Sunrise and sunset times

### 2. Currency & Gold Rates
**Sources:**
- **Currency:** `https://latest.currency-api.pages.dev/v1/currencies/npr.json`
- **Gold/Silver:** `FENEGOSIDA` rates via currency API
- **Fallback:** Internal static data

### 3. Fuel Prices (NOC)
**Source:** `https://noc.org.np/retailprice`

Parses the official NOC HTML page to extract current fuel prices.

### 4. Unicode Suggestions (Google Input Tools)
**Endpoint:** `https://inputtools.google.com/request`

Provides transliteration suggestions for Romanized Nepali text.

---

## 🎯 How to Use

### 📅 Calendar
1. Navigate between months using the `‹` and `›` buttons
2. Select a year from the dropdown (1975–2100)
3. Click any date to view details in the sidebar
4. Click `आज` to return to today's date
5. Use the **Year Selector** to jump to any year

### 🔄 BS ↔ AD Converter
1. Enter a BS date (Year, Month, Day)
2. Click `BS → AD रुपान्तरण` to see the AD equivalent
3. Or enter an AD date and convert to BS
4. Use the "आजको मिति" quick link

### ✨ Rashifal (Horoscope)
1. Select your zodiac sign from the grid
2. Choose Daily, Weekly, or Monthly
3. Select a BS date from the dropdowns
4. Toggle language between Nepali and English
5. Read your personalized horoscope with lucky number, color, and remedy

### 🪐 Kundali Generator
1. Enter birth details (date, time, place)
2. Include latitude, longitude, and timezone
3. Click `✨ Generate Kundali`
4. View your chart, planetary positions, and details
5. Click `Download PDF` to save your Kundali

### 🌤️ Weather
1. Select a city from the dropdown
2. Pick a date (past 30 days to next 16 days)
3. View current weather, 7-day forecast, sunrise/sunset
4. Click `🔄 ताजा गर्नुहोस्` to refresh

### 💰 Gold & Silver
1. Click `🔄 ताजा गर्नुहोस्` to fetch latest rates
2. View prices per tola, 10g, and troy ounce
3. See daily price changes with 📈📉 indicators

### ⌨️ Unicode Converter
1. Type Romanized Nepali in the input box
2. Get instant Unicode output
3. Use Google Input Tools suggestions
4. Copy the result with one click
5. Refer to the typing guide for shortcuts

---

## 📱 PWA Installation Guide

### On Desktop (Chrome/Edge)
1. Visit the website
2. Click the **Install** button in the navbar or the install prompt
3. Click **Install** to add to your desktop
4. The app will open in its own window

### On Android (Chrome)
1. Visit the website
2. Tap the three-dot menu (⋮)
3. Tap **Install App** or **Add to Home Screen**
4. Follow the prompts
5. The app will appear on your home screen

### On iOS (Safari)
1. Visit the website
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Name the app and tap **Add**
5. The app will appear on your home screen

---

## 🧪 Testing

### Lighthouse PWA Score
Run Lighthouse in Chrome DevTools:
```
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Aim for 90+ score
```

### Offline Testing
```
1. Open the website
2. Go to DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Refresh the page — it should still load
5. All cached pages should work
```

### Cross-Browser Testing
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Opera
- ✅ Samsung Internet

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Report Issues
- Use the GitHub Issues tab
- Describe the problem in detail
- Include screenshots if possible
- Mention browser and device

### Suggest Features
- Open a Feature Request issue
- Explain why the feature would be useful
- Provide examples if possible

### Submit Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Development Guidelines
- Keep code clean and well-commented
- Follow existing style conventions
- Test on multiple browsers
- Ensure PWA functionality remains intact
- Update the README if needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Nepali Patro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgements

- **Nepal Rastra Bank** for exchange rate data
- **Open-Meteo** for weather API
- **FENEGOSIDA** for gold and silver rates
- **Nepal Oil Corporation** for fuel prices
- **Google Input Tools** for transliteration
- **html2pdf.js** for PDF generation
- **All contributors** who help improve this project

---

## 📞 Contact & Support

- **Website:** [https://www.nepalipatro.com.np/](https://www.nepalipatro.app/)
- **Email:** support@nepalipatro.app
- **GitHub Issues:** [Report a bug](https://github.com/yourusername/nepali-patro/issues)

---

## ⭐ Support the Project

If you find this project useful, please consider:
- ⭐ Starring the repository on GitHub
- 🗣️ Sharing with friends and family
- 🐛 Reporting any issues you find
- 💡 Suggesting new features

---

## 📊 Project Status

| Status | Badge |
|--------|-------|
| PWA | ✅ Enabled |
| Offline | ✅ Supported |
| Mobile Responsive | ✅ Yes |
| API Integrations | ✅ 4+ APIs |
| Browser Support | ✅ All Major Browsers |
| Documentation | ✅ Complete |

---

## 🔮 Future Roadmap

- [ ] Mobile app (React Native/Flutter)
- [ ] Push notifications for festivals
- [ ] Multiple language support (Nepali, English, Newari)
- [ ] Dark mode toggle
- [ ] User accounts and favorites
- [ ] API for third-party integration
- [ ] More astrological calculations
- [ ] Export calendar as iCal/Google Calendar
- [ ] Desktop app (Electron)

---

*Built with ❤️ for the Nepali community worldwide.*

---

**Made with ❤️ in Nepal 🇳🇵**
