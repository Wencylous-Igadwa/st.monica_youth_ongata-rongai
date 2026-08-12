import { gsap, ScrollTrigger } from './gsap.js';
import { initLenis } from './lenis.js';
import { initNavbar } from './navbar.js';
import { initLoader } from './loader.js';
import { initHero } from './hero.js';
import { initAbout } from './about.js';
import { initEvents } from './events.js';
import { initGallery } from './gallery.js';
import { initPrograms } from './programs.js';
import { initTestimonials } from './testimonials.js';
import { initContact } from './contact.js';
import { initInertia } from './utils/inertia.js';
import { setViewportProps } from './utils/helpers.js';

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

function initScrollAnimations() {
  document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
    gsap.fromTo(el, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' }
    });
  });
}

function initStainedGlass() {
  const sections = [
    { selector: '[data-hero]', accent: '#d4a84b' },
    { selector: '[data-about]', accent: '#d4a84b' },
    { selector: '[data-events]', accent: '#7c5cbf' },
    { selector: '[data-gallery]', accent: '#7c5cbf' },
    { selector: '[data-programs]', accent: '#2dd4bf' },
    { selector: '[data-testimonials]', accent: '#2dd4bf' },
    { selector: '[data-donate]', accent: '#d4a84b' },
    { selector: '[data-contact]', accent: '#d4a84b' },
  ];

  const root = document.documentElement;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        const match = sections.find(s => section.matches(s.selector));
        if (match) {
          root.style.setProperty('--accent-primary', match.accent);
          root.style.setProperty('--accent-primary-rgb', hexToRgb(match.accent));
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(({ selector }) => {
    const el = document.querySelector(selector);
    if (el) observer.observe(el);
  });
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function initHeroSlider() {
  const container = document.querySelector('[data-hero-slider]');
  if (!container) return;
  const slides = container.querySelectorAll('[data-hero-slide]');
  const dotsContainer = container.querySelector('[data-hero-dots]');
  if (!slides.length) return;

  let current = 0;
  let interval;

  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'hero-slider-dot' + (i === 0 ? ' is-active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('.hero-slider-dot');

  function goTo(index) {
    slides.forEach(s => s.classList.remove('is-active'));
    dots.forEach(d => d.classList.remove('is-active'));
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function next() { goTo((current + 1) % slides.length); }

  function startAuto() { interval = setInterval(next, 5000); }
  function stopAuto() { clearInterval(interval); }

  startAuto();

  let touchStartX = 0;
  let touchEndX = 0;
  container.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; stopAuto(); }, { passive: true });
  container.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else goTo((current - 1 + slides.length) % slides.length);
    }
    startAuto();
  }, { passive: true });
}

async function init() {
  setViewportProps();
  const { lenis } = initLenis();

  initInertia();
  initNavbar();
  await initLoader();

  setTimeout(() => {
    document.documentElement.classList.add('fonts-loaded');
  }, 100);

  const hero = initHero();
  initHeroSlider();
  initAbout();
  initEvents();
  initGallery();
  initPrograms();
  initTestimonials();
  initContact();
  initSectionHeaders();
  initScrollAnimations();
  initStainedGlass();

  ScrollTrigger.refresh();

  lenis.emit('scroll');
}

document.addEventListener('DOMContentLoaded', init);
