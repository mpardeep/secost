# SeCost

A sleek, interactive web application for comparing apartment and housing costs across Swedish municipalities. Built with **React**, **Vite**, and **Tailwind CSS**.

**Live Demo:** [https://secost.netlify.app/](https://secost.netlify.app/)

![SeCost Screenshot](./src/assets/hero.png)

## Features

- **Add & Compare Apartments** — Input market value, down payment, interest rate, monthly fee (*avgift*), and municipality.
- **Municipality Tax Comparison** — See how municipal income tax differs between municipalities and compare against a baseline.
- **Swedish Interest Tax Deduction** — Automatically calculates *ränteavdrag* with correct tiers (30% up to 100,000 SEK/year, 20% above).
- **Real-Time Sorting** — Sort by out-of-pocket cost, housing cost, market value, bank payment, or tax difference.
- **Persistent Storage** — All data is saved in `localStorage` so your comparisons survive page reloads.
- **Responsive Design** — Works beautifully on desktop, tablet, and mobile.

## Tech Stack

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [ESLint](https://eslint.org/) — Linting

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/secost.git
cd secost

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## Usage

1. **Set your salary & baseline municipality** in the top settings bar.
2. **Add an apartment** using the "Add Accommodation" button.
3. **Compare** multiple apartments side-by-side in the comparison table.
4. **Click any card** for a detailed cost breakdown.

## Project Structure

```
secost/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images & icons
│   ├── components/      # React components
│   │   ├── ApartmentCard.jsx
│   │   ├── ApartmentDetail.jsx
│   │   └── ApartmentForm.jsx
│   ├── App.jsx          # Main application
│   ├── calculator.js    # Cost calculation logic
│   ├── index.css        # Global styles
│   ├── main.jsx         # Entry point
│   └── taxRates.json    # Swedish municipality tax rates
├── index.html
├── package.json
├── tailwind.config.cjs
└── vite.config.js
```

## License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 PM

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

Made with ❤️ by PM
