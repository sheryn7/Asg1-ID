// ===== NAV, SEARCH, SCROLL SHADOW =====
const nav = document.querySelector('nav');
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchClose = document.getElementById('search-close');
const searchInput = searchBar.querySelector('input');

// open search: hide nav, show bar
if (searchToggle && searchBar && searchClose && searchInput) {
  searchToggle.addEventListener('click', () => {
    nav.classList.add('hide');
    searchBar.classList.add('show');
    searchInput.focus();
  });

  // close search: show nav again
  searchClose.addEventListener('click', () => {
    nav.classList.remove('hide');
    searchBar.classList.remove('show');
  });
}

// shadow on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ===== MOBILE HAMBURGER OVERLAY =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  const navToggleIcon = navToggle.querySelector('i');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');

    // lock/unlock body scroll under overlay
    document.body.classList.toggle('no-scroll', isOpen);

    if (isOpen) {
      navToggleIcon.classList.remove('bi-list');
      navToggleIcon.classList.add('bi-x');
    } else {
      navToggleIcon.classList.remove('bi-x');
      navToggleIcon.classList.add('bi-list');
    }
  });

  // close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        document.body.classList.remove('no-scroll');
        navToggleIcon.classList.remove('bi-x');
        navToggleIcon.classList.add('bi-list');
      }
    });
  });

  const mobileClose = document.getElementById('mobile-close');
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.body.classList.remove('no-scroll');
      navToggleIcon.classList.remove('bi-x');
      navToggleIcon.classList.add('bi-list');
    });
  }
}

// ===== STORES ACCORDION =====
const storeItems = document.querySelectorAll('.store-item');

storeItems.forEach(item => {
  const btn = item.querySelector('.store-btn');
  const icon = item.querySelector('.store-btn-icon');

  if (!btn) return;

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // close all
    storeItems.forEach(other => {
      other.classList.remove('open');
      const otherIcon = other.querySelector('.store-btn-icon');
      if (otherIcon) otherIcon.textContent = '+';
    });

    // open clicked one
    if (!isOpen) {
      item.classList.add('open');
      if (icon) icon.textContent = '-';
    }
  });
});

// ===== BYO LOGIC =====
if (document.querySelector('.byo-section')) {

  // 1. Read set size from URL (?size=6 etc.)
  const params = new URLSearchParams(window.location.search);
  const setSize = parseInt(params.get('size')) || 6;

  // 2. Update BYO text fields
  const subtitleEl     = document.getElementById('byo-subtitle');
  const chooseLabelEl  = document.getElementById('byo-choose-label');

  if (subtitleEl) {
    subtitleEl.textContent = `Mix and match ${setSize} of our cookies`;
  }
  if (chooseLabelEl) {
    chooseLabelEl.textContent = `Choose ${setSize} Cookies`;
  }

  // 3. Helper: calculate current total selected
  function getTotalSelected() {
    let total = 0;
    document.querySelectorAll('.byo-qty-value').forEach(span => {
      total += parseInt(span.textContent, 10) || 0;
    });
    return total;
  }

  // 4. Setup + and – button listeners
  const qtyWrappers = document.querySelectorAll('.byo-qty');

  qtyWrappers.forEach(wrapper => {
    const minusBtn = wrapper.querySelector('.byo-qty-btn:nth-child(1)');
    const valueEl  = wrapper.querySelector('.byo-qty-value');
    const plusBtn  = wrapper.querySelector('.byo-qty-btn:nth-child(3)');

    if (!minusBtn || !plusBtn || !valueEl) return;

    minusBtn.addEventListener('click', () => {
      let current = parseInt(valueEl.textContent, 10) || 0;
      if (current > 0) {
        valueEl.textContent = current - 1;
      }
    });

    plusBtn.addEventListener('click', () => {
      const currentTotal = getTotalSelected();
      if (currentTotal >= setSize) {
        alert(`You can only choose ${setSize} cookies for this set.`);
        return;
      }
      valueEl.textContent = (parseInt(valueEl.textContent, 10) || 0) + 1;
    });
  });

  // 5. Add To Cart → Save data + redirect
  const addBtn = document.querySelector('.byo-add-btn');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const total = getTotalSelected();

      // Not enough cookies
      if (total < setSize) {
        const remaining = setSize - total;
        alert(`You still need to pick ${remaining} more cookie${remaining === 1 ? '' : 's'}.`);
        return;
      }

      // Too many cookies
      if (total > setSize) {
        alert(`You selected ${total}, but only ${setSize} cookies are allowed.`);
        return;
      }

      // Build cookie list
      const cookieList = [];
      document.querySelectorAll('.byo-item').forEach(item => {
        const qtyEl = item.querySelector('.byo-qty-value');
        const nameEl = item.querySelector('.byo-cookie-name');
        if (!qtyEl || !nameEl) return;

        const qty = parseInt(qtyEl.textContent, 10) || 0;
        if (qty > 0) {
          const name = nameEl.textContent;
          cookieList.push({ name, qty });
        }
      });

      // Save to localStorage to load in cart
      const cartData = {
        setSize,
        cookies: cookieList
      };
      localStorage.setItem("nastyCart", JSON.stringify(cartData));

      // Redirect to cart
      window.location.href = "cart.html";
    });
  }
}

// ===== CART INTERACTIONS =====
if (document.querySelector('.cart-section')) {

  const cartItem       = document.querySelector('.cart-item');
  const qtyControls    = document.querySelector('.cart-qty-controls');
  const qtyValueEl     = document.querySelector('.cart-qty-value');
  const removeBtn      = document.querySelector('.cart-remove-btn');
  const lineTotalEl    = document.getElementById('cart-line-total');
  const subtotalEl     = document.getElementById('cart-subtotal');

  const headerEl       = document.querySelector('.cart-header');
  const footerEl       = document.querySelector('.cart-footer');
  const dividerBottom  = document.querySelector('.cart-divider-bottom');
  const emptyBox       = document.getElementById('empty-cart-box');
  const continueBtn    = document.getElementById('continue-shopping-btn');

  const deliveryBtns   = document.querySelectorAll('.cart-delivery-btn');

  // Load BYO data for set name + cookies
  const savedCart = localStorage.getItem('nastyCart');

  if (savedCart && cartItem) {
    const data = JSON.parse(savedCart);
    const nameEl = document.getElementById('card-set-name');
    const listEl = document.getElementById('cart-cookie-list');

    if (nameEl && data.setSize) {
      nameEl.textContent = `Box of ${data.setSize}`;
    }

    if (listEl && Array.isArray(data.cookies)) {
      listEl.innerHTML = '';
      data.cookies.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.qty > 1 ? `${item.name} x${item.qty}` : item.name;
        listEl.appendChild(li);
      });
    }

    // update price based on set size
    const priceMap = { 6: 34, 4: 24, 2: 11 };
    if (priceMap[data.setSize] && cartItem) {
      cartItem.dataset.price = priceMap[data.setSize];
    }
  }

  const unitPrice      = cartItem ? parseFloat(cartItem.dataset.price || '0') : 0;

  function formatMoney(value) {
    return `$${value.toFixed(2)} SGD`;
  }

  // When cart is empty: hide stuff, show message + button box
  function setCartEmpty() {
    if (cartItem)      cartItem.style.display  = 'none';
    if (footerEl)      footerEl.style.display  = 'none';
    if (headerEl)      headerEl.style.display  = 'none';
    if (dividerBottom) dividerBottom.style.display = 'block';
    if (emptyBox)      emptyBox.style.display = 'block';
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      window.location.href = "shop.html";
    });
  }

  function updateTotals() {
    const qty = parseInt(qtyValueEl.textContent, 10) || 0;

    if (qty <= 0) {
      setCartEmpty();
      return;
    }

    const productTotal = unitPrice * qty;

    if (lineTotalEl) lineTotalEl.textContent = formatMoney(productTotal);

    if (subtotalEl) subtotalEl.textContent = formatMoney(productTotal);

    localStorage.setItem(
    "nastyCheckoutTotals",
    JSON.stringify({
      qty: qty,
      unitPrice: unitPrice,
      subtotal: productTotal
    })  
  );   
}

  // ---- Quantity buttons ----
  if (qtyControls && qtyValueEl) {
    const [minusBtnCart, plusBtnCart] = qtyControls.querySelectorAll('.cart-qty-btn');

    if (minusBtnCart && plusBtnCart) {
      minusBtnCart.addEventListener('click', () => {
        let current = parseInt(qtyValueEl.textContent, 10) || 0;
        current--;
        qtyValueEl.textContent = current;
        updateTotals();
      });

      plusBtnCart.addEventListener('click', () => {
        let current = parseInt(qtyValueEl.textContent, 10) || 0;
        current++;
        qtyValueEl.textContent = current;
        updateTotals();
      });
    }
  }

  // ---- Remove button ----
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      setCartEmpty();
    });
  }

  // ---- Delivery buttons (highlight + shipping logic) ----
  deliveryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();

      if (text.includes('Self Pick-Up')) {
        alert('Self pick-up slots are unavailable at the moment. Please try again another time.');

        // keep Nationwide as the selected one (assumed first button)
        deliveryBtns.forEach(b => b.classList.remove('active'));
        if (deliveryBtns[0]) deliveryBtns[0].classList.add('active');
      } else {
        // Nationwide Delivery
        deliveryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }

      updateTotals();
    });
  });

  // Initial calculation on page load
  updateTotals();
}

// ===== CHECKOUT PAGE LOGIC =====
if (document.querySelector('.checkout-summary')) {

  const FREE_THRESHOLD = 20;
  const SHIPPING_FEE   = 5;

  const totalsRaw = localStorage.getItem("nastyCheckoutTotals");
  const cartRaw   = localStorage.getItem("nastyCart");

  // If there's no data (e.g. user came straight here), don't crash
  if (!totalsRaw || !cartRaw) {
    console.warn("Missing checkout/localStorage data");
  } 
  
  else {
    const totals = JSON.parse(totalsRaw);  // { qty, unitPrice, subtotal }
    const cart   = JSON.parse(cartRaw);    // { setSize, cookies: [...] }

    const qty      = totals.qty || 1;
    const subtotal = totals.subtotal || 0;

    // ---- Elements in the summary ----
    const qtyBadgeEl   = document.querySelector(".summary-qty-badge");
    const setNameEl    = document.getElementById("summary-set-name");
    const cookieDescEl = document.getElementById("summary-cookie-desc");
    const priceEl      = document.getElementById("summary-set-price");
    const subtotalEl   = document.getElementById("checkout-subtotal");
    const shippingEl   = document.getElementById("checkout-shipping");
    const totalEl      = document.getElementById("checkout-total");

    const shippingPriceBadge = document.querySelector(".shipping-price");

    // ---- Fill in box name + cookie list ----
    if (setNameEl && cart.setSize) {
      setNameEl.textContent = `Box of ${cart.setSize}`;
    }

    if (cookieDescEl && Array.isArray(cart.cookies)) {
      cookieDescEl.textContent = cart.cookies
        .map(item => item.qty > 1 ? `${item.name} x${item.qty}` : item.name)
        .join(", ");
    }

    // ---- Quantity badge + price for the set ----
    if (qtyBadgeEl) qtyBadgeEl.textContent = qty;

    const priceText = `$${subtotal.toFixed(2)} SGD`;
    if (priceEl)    priceEl.textContent    = priceText;
    if (subtotalEl) subtotalEl.textContent = priceText;

    // ---- Shipping: Free if subtotal ≥ 20, else $5 ----
    let shippingAmount;

    if (subtotal >= FREE_THRESHOLD) {
      shippingAmount = 0;
      if (shippingEl)         shippingEl.textContent = "Free Shipping";
      if (shippingPriceBadge) shippingPriceBadge.textContent = "Free Shipping";
    } else {
      shippingAmount = SHIPPING_FEE;
      const shipText = `$${SHIPPING_FEE.toFixed(2)} SGD`;
      if (shippingEl)         shippingEl.textContent = shipText;
      if (shippingPriceBadge) shippingPriceBadge.textContent = `$${SHIPPING_FEE.toFixed(2)}`;
    }

    // ---- Grand total = subtotal + shipping ----
    const grandTotal = subtotal + shippingAmount;
    if (totalEl) {
      totalEl.textContent = `SGD $${grandTotal.toFixed(2)}`;
    }
  }
  // ===== CHECKOUT FORM VALIDATION & PAY NOW BUTTON =====
if (document.querySelector('.checkout-page')) {

  const payBtn = document.querySelector('.checkout-pay-btn');
  const requiredFields = document.querySelectorAll('.checkout-main .checkout-input');

  if (payBtn && requiredFields.length > 0) {

    // Check if every input has some value
    function allFieldsFilled() {
      let filled = true;
      requiredFields.forEach(field => {
        if (field.value.trim() === '') {
          filled = false;
        }
      });
      return filled;
    }

    // Enable/disable button based on filled state
    function updatePayButtonState() {
      const canPay = allFieldsFilled();
      payBtn.disabled = !canPay;
      payBtn.classList.toggle('disabled', !canPay);
    }

    // Watch all inputs for changes
    requiredFields.forEach(field => {
      field.addEventListener('input', updatePayButtonState);
    });

    // Initial state on page load
    updatePayButtonState();

    // Handle click on Pay Now
    payBtn.addEventListener('click', (e) => {
      // In case someone forces click while disabled
      if (!allFieldsFilled()) {
        e.preventDefault();
        alert('Please fill in all required information before proceeding.');
        return;
      }

      alert('Thank You for Shopping With Us!');
      window.location.href = 'index.html';
    });
  }
}
}

document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const button = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        const arrow  = item.querySelector(".faq-arrow");

        button.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            // (optional) close all others first – true accordion
            faqItems.forEach((other) => {
                if (other !== item) {
                    other.classList.remove("open");
                    const otherAnswer = other.querySelector(".faq-answer");
                    const otherArrow  = other.querySelector(".faq-arrow");
                    otherAnswer.style.maxHeight = null;
                    if (otherArrow) otherArrow.textContent = "▾";
                }
            });

            if (isOpen) {
                item.classList.remove("open");
                answer.style.maxHeight = null;
                arrow.textContent = "▾";
            } else {
                item.classList.add("open");
                answer.style.maxHeight = answer.scrollHeight + "px";
                arrow.textContent = "▴";
            }
        });
    });
});
