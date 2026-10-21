# E-commerce Frontend (React + Vite + Tailwind CSS)

## Run
1. Start the backend (`npm run dev` in Backend, port 4000). Apply `backend-cod-patch` first (needed for Cash on Delivery).
2. In this folder: `npm install` then `npm run dev` → http://localhost:5173
3. API URL is in `.env` (`VITE_API_URL`). Change it if your backend runs elsewhere.

## Logos (replace these two files, keep the names)
- `public/logo-en.png` – English logo: navbar, admin sidebar, login/receipt.
- `public/logo-ta.png` – Tamil logo: footer, login/register side panel, About page, hero fallback.

## Colours
`tailwind.config.js` → `primary` (red) and `secondary` (green). Replace the hex values with the exact shades from your logo.

## Store details
`src/config/site.js` – store name, phone, address, and the static branch list.

## Demo logins (seeded by the backend from its .env)
- Admin: 9999999999 / Admin@123
- Customer: 8888888888 / Demo@123
Set `VITE_SHOW_DEMO=false` in `.env` to hide the quick-fill buttons.

## Admin import / export
Every admin page has Export (Excel or CSV, respects the current filters). Import (Excel/CSV, with a downloadable template)
is available for Categories, Brands, Products and Customers. Products reference category/brand by name (create them first).
Orders can only be exported – the backend creates orders only from a customer's cart.


---
## Jayamangala Agro Foods redesign
- Logo: `public/logo.png` (also saved as logo-en.png / logo-ta.png). Used in navbar, drawer, footer, auth pages.
- Artwork: `public/images/*.svg` – swap for real photos (jpg/webp) and update paths in `src/config/site.js` (`ART`).
- Site copy from the old HTML: `src/config/content.js` and `src/i18n/translations.js`.
- Contact details: `src/config/site.js`.
- Mobile menu is a right-to-left slide-in drawer (`src/layouts/Navbar.jsx`).
