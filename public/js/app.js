// Global Application State & Utilities

const API_BASE = window.location.origin;

// Session Management
const Session = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  save: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isLoggedIn: () => !!localStorage.getItem('token'),
  isAdmin: () => {
    const user = Session.getUser();
    return user && user.role === 'admin';
  },
  isArtisan: () => {
    const user = Session.getUser();
    return user && user.role === 'artisan';
  },
  isCustomer: () => {
    const user = Session.getUser();
    return user && user.role === 'customer';
  }
};

// API Fetch Wrapper (attaches Bearer token if available)
async function apiFetch(endpoint, options = {}) {
  const token = Session.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // Handle unauthorized/expired token
  if (response.status === 401) {
    // If we had a token, it might be expired
    if (token) {
      Session.clear();
      showToast('Session expired. Please log in again.', 'error');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
    }
  }

  return response;
}

// Shopping Cart Utility
const Cart = {
  get: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },
  save: (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
  },
  add: (product, qty = 1) => {
    const cart = Cart.get();
    const existing = cart.find(item => item.productId === product._id);
    
    if (existing) {
      if (existing.quantity + qty > product.stock) {
        showToast(`Cannot add more items. Only ${product.stock} available in stock.`, 'error');
        return false;
      }
      existing.quantity += qty;
    } else {
      if (qty > product.stock) {
        showToast(`Cannot add items. Only ${product.stock} available in stock.`, 'error');
        return false;
      }
      cart.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        quantity: qty
      });
    }
    Cart.save(cart);
    showToast(`Added "${product.title}" to cart.`, 'success');
    return true;
  },
  remove: (productId) => {
    let cart = Cart.get();
    cart = cart.filter(item => item.productId !== productId);
    Cart.save(cart);
    showToast('Item removed from cart.', 'info');
  },
  updateQty: (productId, qty) => {
    const cart = Cart.get();
    const item = cart.find(item => item.productId === productId);
    if (item) {
      if (qty > item.stock) {
        showToast(`Only ${item.stock} items left in stock.`, 'error');
        return false;
      }
      item.quantity = Number(qty);
      Cart.save(cart);
      return true;
    }
    return false;
  },
  clear: () => {
    localStorage.removeItem('cart');
    updateCartBadge();
  },
  totalAmount: () => {
    return Cart.get().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  totalItems: () => {
    return Cart.get().reduce((sum, item) => sum + item.quantity, 0);
  }
};

// Toast Notifications
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '🔔';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `
    <span>${icon} &nbsp; ${message}</span>
    <button style="background:none;border:none;cursor:pointer;color:#888;font-size:1.1rem;" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Update Header Cart Count Badge
function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  if (badge) {
    badge.textContent = Cart.totalItems();
  }
}

// Dynamic Navigation & Footer Rendering
function initializeTemplate() {
  const headerEl = document.querySelector('header');
  const footerEl = document.querySelector('footer');
  const user = Session.getUser();

  if (headerEl) {
    let dashboardLink = '';
    if (user) {
      if (user.role === 'admin') {
        dashboardLink = '<li><a href="/admin-dashboard.html">Admin Panel</a></li>';
      } else if (user.role === 'artisan') {
        dashboardLink = '<li><a href="/artisan-dashboard.html">Artisan Panel</a></li>';
      } else if (user.role === 'customer') {
        dashboardLink = '<li><a href="/customer-dashboard.html">My Account</a></li>';
      }
    }

    const authSection = user
      ? `
        <span style="font-size:0.9rem; font-weight:600; color:var(--primary);">Namaste, ${user.username}</span>
        <button class="btn btn-outline btn-sm" onclick="logoutUser()">Logout</button>
      `
      : `
        <a href="/login.html" class="btn btn-primary btn-sm">Login / Register</a>
      `;

    headerEl.innerHTML = `
      <div class="container nav-container">
        <a href="/index.html" class="logo">
          <div>
            <span class="logo-text">Handloom Artisan</span>
            <span class="logo-tagline">Support Platform</span>
          </div>
        </a>
        
        <ul class="nav-links">
          <li><a href="/index.html">Home</a></li>
          <li><a href="/products.html">Explore Art</a></li>
          ${dashboardLink}
          <li><a href="/contact.html">Contact Us</a></li>
          ${user && user.role === 'customer' ? '<li><a href="/order-tracking.html">Track Order</a></li>' : ''}
        </ul>

        <div class="nav-actions">
          <button class="cart-icon-btn" onclick="window.location.href='/cart.html'" title="View Cart">
            🛒 <span class="cart-count">0</span>
          </button>
          ${authSection}
          <button class="menu-toggle" onclick="toggleMobileMenu()">☰</button>
        </div>
      </div>
    `;
    updateCartBadge();
  }

  if (footerEl) {
    footerEl.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <h3>Handloom Artisan</h3>
            <p>Connecting India's traditional heritage weavers directly with discerning customers. Empowering local economies, maintaining raw integrity.</p>
            <div class="social-links">
              <a href="#" class="social-btn">📘</a>
              <a href="#" class="social-btn">📸</a>
              <a href="#" class="social-btn">🐦</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Quick Navigation</h4>
            <ul class="footer-links">
              <li><a href="/index.html">Home</a></li>
              <li><a href="/products.html">Explore Products</a></li>
              <li><a href="/contact.html">Get in Touch</a></li>
              <li><a href="/login.html">Become an Artisan</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Product Categories</h4>
            <ul class="footer-links">
              <li><a href="/products.html?category=Saree">Traditional Sarees</a></li>
              <li><a href="/products.html?category=Shawl">Woolen Shawls</a></li>
              <li><a href="/products.html?category=Home+Decor">Home Furnishings</a></li>
              <li><a href="/products.html?category=Fabrics">Handloom Fabrics</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Contact Details</h4>
            <p>
              📍 Crafts Council Bhavan, New Delhi, India<br>
              📞 +91 11 2345 6789<br>
              ✉️ support@handloomartisan.org
            </p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Handloom Artisan Support Platform. Made with pride for local weavers. All Rights Reserved.</p>
        </div>
      </div>
    `;
  }
}

// Toggle Navigation Drawer for Mobile Layouts
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}

// Log Out Handler
function logoutUser() {
  Session.clear();
  Cart.clear();
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 1000);
}

// Run onload
document.addEventListener('DOMContentLoaded', initializeTemplate);
