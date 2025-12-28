# Handcraft Kindness Creation — Static Demo Site

This repository contains a simple static front-end demo e-commerce website based on the homepage you provided. It's structured so you can open the pages locally and test shopping flows using LocalStorage.

What is included
- index.html — Home page (converted to use external CSS/JS)
- product.html — Product detail page (populated from URL params)
- cart.html — Cart page (stores items in LocalStorage key `myCrochetCart`)
- all_products.html — Browse all products
- search.html — Search results (reads `?q=...`)
- login.html — Demo login (stores `isLoggedIn=true` in LocalStorage)
- admin_login.html — Simple admin check (username: admin, password: admin123)
- address.html — Shipping / custom order entry (redirects non-logged-in users to login)
- assets/css/styles.css — extracted styles (from your homepage)
- assets/js/app.js — central JS that handles cart, product rendering, search, and mock auth

How to run
1. Clone the repo or download files.
2. Open `index.html` in a browser (Chrome/Firefox/Safari).
3. The demo uses LocalStorage — you can simulate login using the "Dev: Simulate Login" footer link or the login page.

Notes & next steps
- Images referenced under `all photo/` are kept as-is; if those assets don't exist locally, placeholder images will load instead.
- This is a client-side demo (no backend). To make it production-ready you'd:
  - Wire up a real backend (products, auth, cart persistence).
  - Add form validation and secure authentication.
  - Optimize images and assets.

If you want, I can:
- Prepare this as a GitHub Pages deployable bundle.
- Create a simple Express/Node backend with endpoints for products and cart persistence.
- Add Stripe/PayPal checkout mock or integration.

Tell me which next step you'd like and I will create the necessary files/changes.