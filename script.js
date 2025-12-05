// ===== NAV, SEARCH, SCROLL SHADOW =====
const nav = document.querySelector('nav');
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchClose = document.getElementById('search-close');
const searchInput = searchBar.querySelector('input');

// open search: hide nav, show bar
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
const navToggleIcon = navToggle.querySelector('i');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');

  // lock/unlock body scroll under overlay
  document.body.classList.toggle('no-scroll', isOpen);

  // change icon: hamburger ↔ X
  if (isOpen) {
    navToggleIcon.classList.remove('bi-list');
    navToggleIcon.classList.add('bi-x');
  } else {
    navToggleIcon.classList.remove('bi-x');
    navToggleIcon.classList.add('bi-list');
  }
});

// OPTIONAL: close menu when a link is clicked (nice UX)
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

mobileClose.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.classList.remove('no-scroll');
    navToggleIcon.classList.remove('bi-x');
    navToggleIcon.classList.add('bi-list');
});

// ===== STORES ACCORDION =====
const storeItems = document.querySelectorAll('.store-item');

storeItems.forEach(item => {
  const btn = item.querySelector('.store-btn');
  const icon = item.querySelector('.store-btn-icon');

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
      if (icon) icon.textContent = '−';
    }
  });
});
