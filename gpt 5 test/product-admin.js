// Product admin UI & logic (client-side, stores products in localStorage key 'PRODUCTS')
// Requires: window.SAMPLE_PRODUCTS (fallback) and window.renderHomeGrids() exist in the page.

(function () {
  const PRODUCTS_KEY = 'PRODUCTS';
  const ADMIN_FLAG = 'isAdmin';

  // Helpers
  function uid(prefix = 'p') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  }

  function getProducts() {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    // fallback to global SAMPLE_PRODUCTS if present
    if (window.SAMPLE_PRODUCTS && Array.isArray(window.SAMPLE_PRODUCTS)) {
      // clone to avoid modifying original
      return window.SAMPLE_PRODUCTS.map(p => Object.assign({}, p));
    }
    return [];
  }

  function saveProducts(list) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
    // update global SAMPLE_PRODUCTS if present (so other code using it reads current data)
    if (window.SAMPLE_PRODUCTS) window.SAMPLE_PRODUCTS = list;
    // ask homepage to re-render
    if (typeof window.renderHomeGrids === 'function') window.renderHomeGrids();
  }

  // DOM utilities
  function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    });
    children.forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  }

  // Build admin modal
  function buildAdminModal() {
    if (document.getElementById('productAdminModal')) return; // already built

    const modal = el('div', { id: 'productAdminModal', class: 'pa-modal', style: 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:3000;background:rgba(0,0,0,0.4);' });

    const panel = el('div', { class: 'pa-panel', style: 'width:920px;max-width:95%;background:#fff;border-radius:12px;padding:16px;box-shadow:0 10px 40px rgba(0,0,0,0.2);' });

    // header
    const header = el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;' }, [
      el('h3', { style: 'margin:0;font-size:18px' , html: 'Manage Products' }),
      el('div', {}, [
        el('button', { class: 'pa-close-btn', onclick: closeAdmin, style: 'background:#eee;border:0;padding:8px 12px;border-radius:8px;cursor:pointer;' , html: 'Close' })
      ])
    ]);

    // left: product list
    const left = el('div', { style: 'width:52%;display:inline-block;vertical-align:top;padding-right:12px;border-right:1px solid #f0f0f0;height:60vh;overflow:auto;' });
    left.appendChild(el('div', { id: 'paList' }));

    // right: add/edit form
    const right = el('div', { style: 'width:46%;display:inline-block;vertical-align:top;padding-left:12px;' });
    const form = el('form', { id: 'paForm', onsubmit: onFormSubmit });
    // fields: id (hidden), title, price, img, desc
    form.appendChild(el('input', { type: 'hidden', id: 'pa_id', name: 'id' }));
    form.appendChild(el('label', { style: 'display:block;margin-top:8px;font-weight:600' }, ['Title']));
    form.appendChild(el('input', { type: 'text', id: 'pa_title', name: 'title', required: true, style: 'width:100%;padding:8px;margin-top:6px;border:1px solid #ddd;border-radius:8px;' }));
    form.appendChild(el('label', { style: 'display:block;margin-top:8px;font-weight:600' }, ['Price (number)']));
    form.appendChild(el('input', { type: 'number', id: 'pa_price', name: 'price', required: true, style: 'width:100%;padding:8px;margin-top:6px;border:1px solid #ddd;border-radius:8px;' }));
    form.appendChild(el('label', { style: 'display:block;margin-top:8px;font-weight:600' }, ['Image URL']));
    form.appendChild(el('input', { type: 'url', id: 'pa_img', name: 'img', placeholder: 'https://...', style: 'width:100%;padding:8px;margin-top:6px;border:1px solid #ddd;border-radius:8px;' }));
    form.appendChild(el('label', { style: 'display:block;margin-top:8px;font-weight:600' }, ['Short Description']));
    form.appendChild(el('textarea', { id: 'pa_desc', name: 'desc', rows: 4, style: 'width:100%;padding:8px;margin-top:6px;border:1px solid #ddd;border-radius:8px;' }));

    const btnRow = el('div', { style: 'display:flex;gap:8px;margin-top:12px;' }, [
      el('button', { type: 'submit', class: 'pa-save-btn', style: 'background:#222;color:white;padding:10px 14px;border-radius:8px;border:0;cursor:pointer;' , html: 'Save' }),
      el('button', { type: 'button', onclick: resetForm, style: 'background:#fff;border:1px solid #ddd;padding:10px 14px;border-radius:8px;cursor:pointer;' , html: 'Reset' }),
      el('button', { type: 'button', id: 'paDeleteBtn', style: 'background:#ff4d4d;color:white;padding:10px 14px;border-radius:8px;border:0;cursor:pointer;display:none;' , onclick: onDelete, html: 'Delete' })
    ]);
    form.appendChild(btnRow);
    right.appendChild(form);

    panel.appendChild(header);
    const content = el('div', { style: 'display:flex;gap:12px;' }, [left, right]);
    panel.appendChild(content);
    modal.appendChild(panel);
    document.body.appendChild(modal);

    renderProductList();
  }

  // Render list of products in admin panel
  function renderProductList() {
    const listContainer = document.getElementById('paList');
    if (!listContainer) return;
    const products = getProducts();
    listContainer.innerHTML = '';
    products.forEach(p => {
      const item = el('div', { style: 'display:flex;gap:10px;padding:10px;border-bottom:1px solid #f3f3f3;align-items:center;cursor:pointer;' });
      const img = el('img', { src: p.images && p.images[0] ? p.images[0] : (p.img || 'https://placehold.co/80x80?text=No+Image'), style: 'width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #eee;' });
      const info = el('div', { style: 'flex:1' });
      info.appendChild(el('div', { style: 'font-weight:700' }, [p.title || p.name || 'Untitled']));
      info.appendChild(el('div', { style: 'color:#777;font-size:13px' }, ['₹' + (p.price || 0)]));
      const actions = el('div', {});
      const editBtn = el('button', { type: 'button', style: 'background:#fff;border:1px solid #ddd;padding:6px 10px;border-radius:8px;cursor:pointer;margin-right:6px;' , onclick: () => fillFormForEdit(p.id || p.id) }, ['Edit']);
      const delBtn = el('button', { type: 'button', style: 'background:#ff4d4d;color:white;border:0;padding:6px 10px;border-radius:8px;cursor:pointer;' , onclick: (e) => { e.stopPropagation(); onDelete(p.id); } }, ['Delete']);
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      item.appendChild(img);
      item.appendChild(info);
      item.appendChild(actions);
      item.addEventListener('click', () => fillFormForEdit(p.id || p.id));
      listContainer.appendChild(item);
    });

    // add quick "Add new product" button at bottom
    const addRow = el('div', { style: 'padding:12px;text-align:center' }, [
      el('button', { style: 'background:var(--primary);color:#fff;padding:10px 16px;border-radius:8px;border:0;cursor:pointer;', onclick: openNewProductForm }, ['+ Add New Product'])
    ]);
    listContainer.appendChild(addRow);
  }

  function openNewProductForm() {
    resetForm();
    document.getElementById('paDeleteBtn').style.display = 'none';
  }

  function fillFormForEdit(id) {
    const products = getProducts();
    const p = products.find(x => String(x.id) === String(id));
    if (!p) return;
    const idEl = document.getElementById('pa_id');
    idEl.value = p.id;
    document.getElementById('pa_title').value = p.title || p.name || '';
    document.getElementById('pa_price').value = p.price || p.price || 0;
    // support previous fields
    document.getElementById('pa_img').value = (p.images && p.images[0]) || p.img || '';
    document.getElementById('pa_desc').value = p.desc || p.description || '';
    document.getElementById('paDeleteBtn').style.display = 'inline-block';
  }

  function resetForm() {
    document.getElementById('paForm').reset();
    document.getElementById('pa_id').value = '';
    document.getElementById('paDeleteBtn').style.display = 'none';
  }

  function onFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('pa_id').value;
    const title = document.getElementById('pa_title').value.trim();
    const price = Number(document.getElementById('pa_price').value) || 0;
    const img = document.getElementById('pa_img').value.trim();
    const desc = document.getElementById('pa_desc').value.trim();

    if (!title) { alert('Title required'); return; }

    const products = getProducts();
    if (id) {
      // update
      const idx = products.findIndex(p => String(p.id) === String(id));
      if (idx > -1) {
        products[idx].title = title;
        products[idx].price = price;
        // update both img and images[0] for compatibility
        products[idx].img = img;
        products[idx].images = img ? [img].concat((products[idx].images||[]).slice(1)) : (products[idx].images || []);
        products[idx].desc = desc;
      }
    } else {
      // add new
      const newP = {
        id: uid('p'),
        title: title,
        price: price,
        img: img,
        images: img ? [img] : [],
        desc: desc
      };
      products.unshift(newP);
    }

    saveProducts(products);
    renderProductList();
    resetForm();
    showToast('Saved product');
  }

  function onDelete(idParam) {
    let id = idParam;
    if (!id) {
      id = document.getElementById('pa_id').value;
      if (!id) { alert('No product selected'); return; }
    }
    if (!confirm('Delete this product?')) return;
    const products = getProducts().filter(p => String(p.id) !== String(id));
    saveProducts(products);
    renderProductList();
    resetForm();
    showToast('Deleted product');
  }

  function showAdminIfAllowed() {
    // show Manage Products button in header if admin
    const isAdmin = localStorage.getItem(ADMIN_FLAG) === 'true';
    if (!isAdmin) return;

    // avoid adding twice
    if (document.getElementById('manageProductsBtn')) return;

    // find header right area (best-effort)
    // we will append to header
    const header = document.querySelector('header');
    if (!header) return;

    const btn = el('button', { id: 'manageProductsBtn', style: 'margin-right:12px;background:transparent;border:1px solid rgba(255,255,255,0.15);color:white;padding:8px 12px;border-radius:10px;cursor:pointer;font-weight:600;' , onclick: openAdmin }, ['Manage Products']);
    // place near header-right (append to header)
    header.appendChild(btn);
  }

  function openAdmin() {
    buildAdminModal();
    document.getElementById('productAdminModal').style.display = 'flex';
    renderProductList();
  }

  function closeAdmin() {
    const modal = document.getElementById('productAdminModal');
    if (modal) modal.style.display = 'none';
  }

  // expose for debugging
  window.productAdmin = {
    getProducts,
    saveProducts,
    openAdmin,
    closeAdmin
  };

  // init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    showAdminIfAllowed();
    // if admin and user wants to open via ?admin param, open automatically
    if (localStorage.getItem(ADMIN_FLAG) === 'true' && new URLSearchParams(location.search).has('openAdmin')) {
      openAdmin();
    }
  });

})();