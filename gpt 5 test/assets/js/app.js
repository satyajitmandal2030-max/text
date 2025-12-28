// Central JS for the small static ecommerce demo site.
// Functions are attached to window for cross-page usage.

// ---------------------------
// Sample product data
// ---------------------------
const SAMPLE_PRODUCTS = [
  { id: 'p1', title: 'Happy Taddy', price: 1000, img: 'all photo/Gemini_Generated_Image_oixgmjoixgmjoixg.png', desc: 'Hand-stitched taddy with love.' },
  { id: 'p2', title: 'Blue Bag', price: 200, img: 'all photo/Gemini_Generated_Image_iy33wjiy33wjiy33.png', desc: 'Summer boho bag.' },
  { id: 'p3', title: 'Fantastic Puppy', price: 1500, img: 'all photo/Gemini_Generated_Image_mya860mya860mya8.png', desc: 'Soft puppy toy.' },
  { id: 'p4', title: 'Small Taddy', price: 500, img: 'all photo/Gemini_Generated_Image_vu8ufgvu8ufgvu8u.png', desc: 'Cute small taddy.' },
  { id: 'p5', title: 'Pokimon Toy', price: 100, img: 'all photo/Gemini_Generated_Image_kf8mp9kf8mp9kf8m.png', desc: 'Popular character toy.' },
  { id: 'p6', title: 'Boho Bag', price: 1500, img: 'all photo/Gemini_Generated_Image_jx3e28jx3e28jx3e.png', desc: 'Large boho shoulder bag.' },
  { id: 'p7', title: 'Tree Toy', price: 950, img: 'all photo/Gemini_Generated_Image_lcyd0slcyd0slcyd.png', desc: 'Handmade tree toy.' },
  { id: 'p8', title: 'Wool Hat', price: 850, img: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=600&q=80', desc: 'Warm wool hat.' },
  { id: 'p9', title: 'Winter Scarf', price: 100, img: 'all photo/Gemini_Generated_Image_8ip7md8ip7md8ip7.png', desc: 'Cozy winter scarf.' },
  { id: 'p10', title: 'Hand Glaps', price: 500, img: 'all photo/Gemini_Generated_Image_1pu8pl1pu8pl1pu8.png', desc: 'Handmade gloves.' },
  { id: 'p11', title: 'Children Shoo', price: 400, img: 'all photo/Gemini_Generated_Image_ooz30cooz30cooz3.png', desc: 'Cute children shoes.' },
  { id: 'p12', title: 'Flower Degine', price: 1600, img: 'all photo/Gemini_Generated_Image_uijcoeuijcoeuijc.png', desc: 'Decorative flower design.' },
];

// ---------------------------
// CART STORAGE UTILITIES
// ---------------------------
const CART_KEY = 'myCrochetCart';
function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateCartCount() {
  const cart = getCart();
  const totalCount = cart.reduce((acc, i) => acc + (i.qty || 0), 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.innerText = totalCount;
  if (badge && totalCount > 0){
    badge.style.transform = 'scale(1.5)';
    setTimeout(()=> badge.style.transform = 'scale(1)', 200);
  }
}

// Expose for HTML onclick usage
window.addToCart = function addToCart(btnElementOrProduct) {
  // Allow calling with either a button inside card, or a product object or product id.
  let product;
  if (typeof btnElementOrProduct === 'string') {
    product = SAMPLE_PRODUCTS.find(p => p.id === btnElementOrProduct);
  } else if (btnElementOrProduct && btnElementOrProduct.id) {
    product = btnElementOrProduct;
  } else {
    // clicked from a button inside card
    const btn = btnElementOrProduct;
    const card = btn.closest ? btn.closest('.product-card') : null;
    if (card) {
      const id = card.dataset.id;
      product = SAMPLE_PRODUCTS.find(p => p.id === id) || {
        title: card.querySelector('h3')?.innerText || 'Item',
        price: parseInt((card.querySelector('.price')?.innerText || '0').replace(/[₹,]/g, '')) || 0,
        img: card.querySelector('img')?.src || ''
      };
    }
  }

  if (!product) {
    showToast('Unable to add item.');
    return;
  }

  const cart = getCart();
  const existing = cart.find(i => i.id === product.id || i.title === product.title);
  if (existing) {
    existing.qty = (existing.qty || 0) + 1;
  } else {
    cart.push({ id: product.id || null, title: product.title, price: product.price, img: product.img, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();

  if (typeof btnElementOrProduct === 'object' && btnElementOrProduct.tagName === 'BUTTON') {
    const btn = btnElementOrProduct;
    const original = btn.innerText;
    btn.innerText = 'Done!';
    btn.style.background = '#4CAF50';
    btn.style.color = 'white';
    setTimeout(()=> { btn.innerText = original; btn.style.background=''; btn.style.color=''; }, 800);
  }
  showToast('Added to cart!');
};

// ---------------------------
// VIEW PRODUCT (redirect to product page with params)
// ---------------------------
window.viewProduct = function viewProduct(cardOrId) {
  let prod;
  if (typeof cardOrId === 'string') {
    prod = SAMPLE_PRODUCTS.find(p => p.id === cardOrId);
  } else {
    const card = cardOrId.closest ? cardOrId.closest('.product-card') : cardOrId;
    const id = card?.dataset?.id;
    prod = SAMPLE_PRODUCTS.find(p => p.id === id) || {
      title: card?.querySelector('h3')?.innerText,
      price: card?.querySelector('.price')?.innerText,
      img: card?.querySelector('img')?.src,
      desc: ''
    };
  }
  if (!prod) { showToast('Product not found'); return; }
  const params = new URLSearchParams({ id: prod.id, title: prod.title, price: prod.price, img: prod.img, desc: prod.desc });
  window.location.href = 'product.html?' + params.toString();
};

// ---------------------------
// SLIDER
// ---------------------------
let currentSlide = 0;
function updateSlider() {
  const wrapper = document.getElementById('sliderWrapper') || document.querySelector('.slider-wrapper');
  const slides = wrapper ? wrapper.querySelectorAll('.slide') : [];
  if (!wrapper || slides.length === 0) return;
  wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
}
function nextSlide() {
  const wrapper = document.getElementById('sliderWrapper') || document.querySelector('.slider-wrapper');
  const slides = wrapper ? wrapper.querySelectorAll('.slide') : [];
  if (slides.length === 0) return;
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
}
setInterval(nextSlide, 5000);

// ---------------------------
// SEARCH TOGGLE & NAV
// ---------------------------
window.toggleSearch = function toggleSearch() {
  const searchWrapper = document.getElementById('searchWrapper');
  const searchInput = document.getElementById('searchInput');
  if (!searchWrapper) return;
  searchWrapper.classList.toggle('active');
  if (searchWrapper.classList.contains('active') && searchInput) searchInput.focus();
};

// press Enter on homepage search
document.addEventListener('keypress', (e) => {
  const target = e.target;
  if (target && target.id === 'searchInput' && e.key === 'Enter') {
    e.preventDefault();
    window.location.href = 'search.html?q=' + encodeURIComponent(target.value);
  }
});

// ---------------------------
// CUSTOM IMAGE UPLOAD
// ---------------------------
window.handleCustomUpload = function handleCustomUpload(input) {
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  const MAX_SIZE = 3 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    showToast('Error: File size exceeds 3MB!');
    input.value = '';
    return;
  }
  showToast('Checking login status...');
  setTimeout(() => {
    if (isUserLoggedIn()) {
      window.location.href = 'address.html?type=custom_order';
    } else {
      window.location.href = 'login.html?redirect=address.html&type=custom_order';
    }
  }, 800);
};

// ---------------------------
// AUTH MOCK
// ---------------------------
window.isUserLoggedIn = function () {
  return localStorage.getItem('isLoggedIn') === 'true';
};

// ---------------------------
// TOAST
// ---------------------------
window.showToast = function showToast(message) {
  const t = document.getElementById('toast');
  if (!t) return alert(message);
  t.innerText = message;
  t.className = 'toast show';
  setTimeout(()=> { t.className = t.className.replace('show', ''); }, 3000);
};

// ---------------------------
// MOBILE MENU
// ---------------------------
window.toggleMenu = function toggleMenu() {
  showToast('Opening Menu (Search, Login, Cart, More)...');
};

// ---------------------------
// RENDER UTILITIES (inject product cards)
// ---------------------------
function createCard(product, showButtons = true) {
  const div = document.createElement('div');
  div.className = 'product-card';
  if (product.id) div.dataset.id = product.id;
  div.onclick = function() { viewProduct(div); };

  div.innerHTML = `
    <img src="${product.img}" onerror="this.src='https://placehold.co/400x400?text=${encodeURIComponent(product.title)}'" alt="${product.title}">
    <div class="product-info">
      <h3>${product.title}</h3>
      <p class="price">₹${product.price}</p>
      ${ showButtons ? `
        <div class="btn-group">
          <button class="btn-add" onclick="event.stopPropagation(); addToCart(this.closest('.product-card'))">Add</button>
          <button class="btn-buy" onclick="event.stopPropagation(); viewProduct(this.closest('.product-card'))">Buy</button>
        </div>` : `<button class="add-btn" onclick="event.stopPropagation(); addToCart(this.closest('.product-card'))">Add</button>`}
    </div>
  `;
  return div;
}

function renderHomeGrids() {
  const featured = document.getElementById('featuredGrid');
  const trending = document.getElementById('trendingGrid');
  const collection = document.getElementById('collectionGrid');

  if (featured) {
    featured.innerHTML = '';
    SAMPLE_PRODUCTS.slice(0,4).forEach(p => featured.appendChild(createCard(p)));
  }
  if (trending) {
    trending.innerHTML = '';
    SAMPLE_PRODUCTS.slice(4,8).forEach(p => trending.appendChild(createCard(p)));
  }
  if (collection) {
    collection.innerHTML = '';
    SAMPLE_PRODUCTS.slice(0,6).forEach(p => collection.appendChild(createCard(p)));
  }
}

// ---------------------------
// PAGE-SPECIFIC INIT
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderHomeGrids();

  // If on product.html, populate product details
  if (document.body.contains(document.querySelector('#product-page'))) {
    populateProductPage();
  }

  // If on cart page
  if (document.body.contains(document.querySelector('#cart-page'))) {
    renderCartPage();
  }

  // If on all_products page
  if (document.body.contains(document.querySelector('#all-products-page'))) {
    renderAllProducts();
  }

  // If on search page
  if (document.body.contains(document.querySelector('#search-page'))) {
    renderSearchResults();
  }
});

// ---------------------------
// PRODUCT PAGE HELPERS
// ---------------------------
function populateProductPage() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const title = params.get('title');
  const price = params.get('price');
  const img = params.get('img');
  const desc = params.get('desc');

  const container = document.getElementById('product-page');
  if (!container) return;

  container.innerHTML = `
    <div class="product-detail">
      <div style="max-width:600px;margin:0 auto;padding:30px;background:white;border-radius:16px;">
        <img src="${img}" onerror="this.src='https://placehold.co/600x400?text=${encodeURIComponent(title||'Product')}'" alt="${title}" style="width:100%;height:auto;border-radius:12px;">
        <h2 style="margin-top:18px">${title}</h2>
        <p style="font-weight:700">₹${price}</p>
        <p style="color:#555">${desc || 'No description provided.'}</p>
        <div style="display:flex;gap:12px;margin-top:12px;">
          <button class="add-btn" onclick="addToCart({ id: '${id}', title: '${(title||'').replace(/'/g,"\\'")}', price: ${price}, img: '${(img||'').replace(/'/g,"\\'")}' })">Add to cart</button>
          <button class="show-more-btn" onclick="window.location.href='checkout.html'">Checkout</button>
        </div>
      </div>
    </div>
  `;
}
window.populateProductPage = populateProductPage;

// ---------------------------
// CART PAGE HELPERS
// ---------------------------
function renderCartPage() {
  const container = document.getElementById('cart-page');
  if (!container) return;
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px"><h3>Your cart is empty</h3><p><a href="index.html">Continue shopping</a></p></div>`;
    return;
  }

  const table = document.createElement('div');
  table.style.maxWidth = '1000px';
  table.style.margin = '0 auto';
  table.style.padding = '20px';
  table.style.background = 'white';
  table.style.borderRadius = '12px';

  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * (item.qty || 1);
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '16px';
    row.style.padding = '12px 0';
    row.innerHTML = `
      <img src="${item.img}" onerror="this.src='https://placehold.co/120x80?text=${encodeURIComponent(item.title)}'" style="width:120px;height:80px;object-fit:cover;border-radius:8px;">
      <div style="flex:1">
        <strong>${item.title}</strong>
        <div style="color:#666">₹${item.price}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button onclick="changeQty(${idx}, -1)">-</button>
        <div>${item.qty}</div>
        <button onclick="changeQty(${idx}, 1)">+</button>
      </div>
      <div style="width:120px;text-align:right">₹${item.price * item.qty}</div>
      <div style="width:60px"><button onclick="removeItem(${idx})">Remove</button></div>
    `;
    table.appendChild(row);
  });

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.marginTop = '20px';
  footer.innerHTML = `<strong>Total: ₹${total}</strong><div><button class="show-more-btn" onclick="checkout()">Proceed to Checkout</button></div>`;

  container.innerHTML = '';
  container.appendChild(table);
  container.appendChild(footer);
}
window.renderCartPage = renderCartPage;

window.changeQty = function changeQty(index, diff) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, (cart[index].qty || 1) + diff);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
};

window.removeItem = function removeItem(index) {
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
};

window.checkout = function checkout() {
  if (!isUserLoggedIn()) {
    window.location.href = 'login.html?redirect=cart.html';
    return;
  }
  // For demo: clear cart and show success
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  showToast('Order placed successfully!');
  renderCartPage();
};

// ---------------------------
// ALL PRODUCTS and SEARCH
// ---------------------------
function renderAllProducts() {
  const container = document.getElementById('all-products-page');
  if (!container) return;
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  SAMPLE_PRODUCTS.forEach(p => grid.appendChild(createCard(p, true)));
  container.appendChild(grid);
}

function renderSearchResults() {
  const q = new URLSearchParams(location.search).get('q') || '';
  const container = document.getElementById('search-page');
  if (!container) return;
  const results = SAMPLE_PRODUCTS.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || (p.desc||'').toLowerCase().includes(q.toLowerCase()));
  container.innerHTML = `<div style="max-width:1200px;margin:20px auto"><h3>Search results for "${q}" — ${results.length} found</h3></div>`;
  const grid = document.createElement('div'); grid.className = 'product-grid';
  results.forEach(r => grid.appendChild(createCard(r, true)));
  container.appendChild(grid);
}

// ---------------------------
// Utilities: simple router-like checks
// ---------------------------
(function attachPagePlaceholders() {
  // Product page root placeholder. Pages that need feature should include an element with these IDs.
  // product.html: <div id="product-page"></div>
  // cart.html: <div id="cart-page"></div>
  // all_products.html: <div id="all-products-page"></div>
  // search.html: <div id="search-page"></div>
})();