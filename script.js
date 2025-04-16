document.addEventListener('DOMContentLoaded', () => {
  [setupPreloader, setupMobileMenu, setupCookiePopup,
    updateUserProfile, setupProducts, animateHero, setupLinks]
    .forEach(fn => fn());
});

// Preloader
function setupPreloader() {
  if (!document.getElementById('preloader')) {
    document.body.insertAdjacentHTML('afterbegin',
      `<div id="preloader"><div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div></div>`
    );
  }

  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const hidePreloader = () => {
    preloader.style.opacity = '0';
    document.body.classList.add('loaded');
    setTimeout(() => preloader.style.display = 'none', 500);
  };

  window.addEventListener('load', () => setTimeout(hidePreloader, 800));
  setTimeout(() => document.body.classList.contains('loaded') || hidePreloader(), 4000);
}

// Mobile menu
function setupMobileMenu() {
  const navbar = document.getElementById('navbar');
  document.getElementById('bar')?.addEventListener('click', () => navbar?.classList.toggle('active'));
  document.getElementById('close')?.addEventListener('click', () => navbar?.classList.remove('active'));
}

// Cookie popup
function setupCookiePopup() {
  const popup = document.getElementById('cookie-popup');
  if (!popup) return;

  popup.style.display = 'flex';

  const handleChoice = (accepted) => {
    popup.style.opacity = '0';
    setTimeout(() => popup.style.display = 'none', 300);
    localStorage.setItem('cookies-accepted', accepted);
  };

  document.getElementById('accept-cookie')?.addEventListener('click', () => handleChoice('true'));
  document.getElementById('deny-cookie')?.addEventListener('click', () => handleChoice('false'));
}

function updateUserProfile() {
  const authLink = document.getElementById('authLink');
  const profileIcon = document.getElementById('userProfileIcon');
  if (!authLink || !profileIcon) return;

  const currentUser = localStorage.getItem('currentUser');

  if (currentUser) {
    authLink.textContent = 'Sign-out';

    const newLink = authLink.cloneNode(true);
    authLink.parentNode.replaceChild(newLink, authLink);

    newLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });

    profileIcon.style.display = 'inline-block';

    try {
      const data = JSON.parse(currentUser);
      if (data.email) {
        profileIcon.querySelector('a').title = `Logged in as ${data.email}`;

        if (data.name && document.getElementById('hero')) {
          const welcome = document.createElement('div');
          welcome.className = 'welcome-msg';
          welcome.textContent = `Welcome back, ${data.name}!`;
          document.getElementById('hero').prepend(welcome);
        }
      }
    } catch (e) { }
  } else {
    authLink.textContent = 'Sign-in';
    authLink.href = window.location.pathname.includes('/pages/') ? 'signin.html' : 'pages/signin.html';
    profileIcon.style.display = 'none';
  }
}

function setupProducts() {
  document.querySelectorAll('.wch').forEach(card => {
    const cart = card.querySelector('.cart');

    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.classList.add('hover-active');
      if (cart) cart.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('hover-active');
      if (cart) cart.style.opacity = '0.7';
    });

    cart?.addEventListener('click', e => {
      e.preventDefault();
      const name = card.querySelector('.dis h5')?.textContent || 'Product';

      cart.classList.add('added');
      setTimeout(() => cart.classList.remove('added'), 1000);

      notify(`${name} added to cart!`);
    });
  });
}

// Hero animation
function animateHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const elements = ['h4', 'h2', 'h1', 'p', 'button'].map(sel => hero.querySelector(sel)).filter(Boolean);

  if (elements.length) {
    let delay = 0;
    elements.forEach(el => {
      setTimeout(() => el.classList.add('fade-in'), delay);
      delay += 400;
    });
  }
}

function setupLinks() {
  document.querySelectorAll('a:not([href^="#"]):not([href^="javascript"])').forEach(link => {
    if (link.hostname !== window.location.hostname && link.hostname !== '') return;

    link.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      const href = this.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:')) return;

      e.preventDefault();

      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.display = 'flex';
        preloader.style.opacity = '1';
        document.body.classList.remove('loaded');
      }

      setTimeout(() => window.location.href = href, 300);
    });
  });
}

function notify(message) {
  let container = document.getElementById('notification-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
  }

  const note = document.createElement('div');
  note.className = 'notification';
  note.textContent = message;
  container.appendChild(note);

  // Animation sequence
  setTimeout(() => note.style.right = '0', 10);
  setTimeout(() => {
    note.style.right = '-300px';
    note.style.opacity = '0';
    setTimeout(() => note.remove(), 300);
  }, 3000);
}