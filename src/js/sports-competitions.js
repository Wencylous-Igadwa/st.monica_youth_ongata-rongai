import { gsap, ScrollTrigger } from './gsap.js';
import { initLenis } from './lenis.js';
import { initNavbar } from './navbar.js';
import { initLoader } from './loader.js';
import { initInertia } from './utils/inertia.js';
import { loadList } from './utils/data.js';

const HOF_DEFAULTS = [];

let hofData = [...HOF_DEFAULTS];

function initSectionHeaders() {
  document.querySelectorAll('[data-split-lines]').forEach(el => {
    gsap.fromTo(el, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'top 40%',
        toggleActions: 'play none none none',
      }
    });
  });

  document.querySelectorAll('[data-section-header]').forEach(el => {
    const tag = el.querySelector('.section-tag');
    const divider = el.querySelector('.section-divider');
    if (tag) {
      gsap.fromTo(tag, { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }
    if (divider) {
      gsap.fromTo(divider, { scaleX: 0 }, {
        scaleX: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' }
      });
    }
  });
}

async function initHofCards() {
  hofData = await loadList('hof', HOF_DEFAULTS);
  const container = document.querySelector('[data-hof-container]');
  if (!container) return;

  const items = hofData;
  container.innerHTML = items.map(item => `
    <div class="hof-card">
      <div class="hof-icon">${item.icon || '🏆'}</div>
      <div class="hof-year">${item.year || ''}</div>
      <h3 class="hof-title">${item.title || ''}</h3>
      <p class="hof-desc">${item.desc || ''}</p>
    </div>
  `).join('');

  gsap.fromTo('.hof-card', { y: 40, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: {
      trigger: '[data-hof-grid]',
      start: 'top 80%',
      toggleActions: 'play none none none',
    }
  });
}

async function init() {
  const { lenis } = initLenis();

  initInertia();
  initNavbar();
  await initLoader();

  setTimeout(() => {
    document.documentElement.classList.add('fonts-loaded');
  }, 100);

  initSectionHeaders();
  initHofCards();

  ScrollTrigger.refresh();
  lenis.emit('scroll');
}

document.addEventListener('DOMContentLoaded', init);
