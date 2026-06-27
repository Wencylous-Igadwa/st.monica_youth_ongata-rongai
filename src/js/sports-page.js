import { gsap, ScrollTrigger } from './gsap.js';
import { initLenis } from './lenis.js';
import { initNavbar } from './navbar.js';
import { initLoader } from './loader.js';
import { initInertia } from './utils/inertia.js';

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

function initSportsCards() {
  gsap.fromTo('[data-sports-card]', { y: 40, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out',
    scrollTrigger: {
      trigger: '[data-sports-categories]',
      start: 'top 75%',
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
  initSportsCards();

  ScrollTrigger.refresh();
  lenis.emit('scroll');
}

document.addEventListener('DOMContentLoaded', init);
