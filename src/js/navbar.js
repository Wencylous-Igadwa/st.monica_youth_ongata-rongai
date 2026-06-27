export function initNavbar() {
  const navbar = document.querySelector('[data-navbar]');
  const hamburger = document.querySelector('[data-nav-hamburger]');
  const navLinks = document.querySelector('[data-nav-links]');
  const navInner = navbar?.querySelector('.nav-inner');
  let lastScroll = 0;

  function repositionNavLinks() {
    if (!navLinks || !navInner || !navbar) return;
    const isMobile = window.innerWidth < 992;
    const isOutside = navLinks.parentElement !== navInner;

    if (isMobile && !isOutside) {
      navbar.appendChild(navLinks);
    } else if (!isMobile && isOutside) {
      const navActions = navInner.querySelector('.nav-actions');
      navInner.insertBefore(navLinks, navActions);
    }
  }

  repositionNavLinks();
  window.addEventListener('resize', repositionNavLinks);

  const themeToggle = document.querySelector('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '☀️';
  }

  themeToggle?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      themeToggle.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeToggle.textContent = '☀️';
    }
  });

  function onScroll() {
    const scrollY = window.scrollY || window.lenis?.scroll || 0;
    if (scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  if (window.lenis) {
    window.lenis.on('scroll', onScroll);
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('[data-nav-link]').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  onScroll();
}
