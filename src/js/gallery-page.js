import { gsap, ScrollTrigger } from './gsap.js';
import { initLenis } from './lenis.js';
import { initNavbar } from './navbar.js';
import { initLoader } from './loader.js';
import { initInertia } from './utils/inertia.js';
import { loadList } from './utils/data.js';

const GALLERY_DEFAULTS = [];

let galleryData = [...GALLERY_DEFAULTS];

async function renderGallery() {
  const container = document.querySelector('[data-gallery-container]');
  if (!container) return;
  const items = galleryData;
  container.innerHTML = items.map(item => {
    const firstImg = item.images && item.images[0] ? item.images[0] : '/images/koh-01.jpeg';
    return `
      <div class="event-highlight" data-event-highlight='${JSON.stringify(item.images || [])}'>
        <div class="event-highlight-image">
          <img src="${firstImg}" alt="${item.title}" loading="lazy">
          <div class="event-highlight-image-overlay"></div>
        </div>
        <div class="event-highlight-info">
          <h3 class="event-highlight-title">${item.title}</h3>
          <span class="event-highlight-meta">${item.meta || ''}</span>
        </div>
      </div>`;
  }).join('');
}

const FAN_CARD_COUNT = 8;
const FAN_RADIUS = 220;
const FAN_ARC = 80;
const FAN_START_ANGLE = -40;

let activeFan = null;
let fanTween = null;

function closeFan() {
  if (!activeFan) {
    fanTween = null;
    return;
  }
  if (fanTween) {
    fanTween.kill();
    fanTween = null;
  }
  const overlay = activeFan;
  activeFan = null;
  const cards = overlay.querySelectorAll('.fan-card');
  gsap.to(cards, {
    scale: 0.5, opacity: 0, duration: 0.25, ease: 'power2.in',
    stagger: 0.015, overwrite: true,
    onComplete: () => {
      overlay.classList.remove('is-open');
      setTimeout(() => overlay.remove(), 400);
    }
  });
}

function openFan(images, originRect) {
  closeFan();

  const N = Math.min(images.length, FAN_CARD_COUNT);
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const isMobile = vw < 768;
  const CARD_W = isMobile ? Math.min(140, (vw - 48) / 2) : vw < 992 ? 200 : 280;
  const CARD_H = isMobile ? 105 : vw < 992 ? 150 : 210;
  const cols = isMobile ? 2 : vw < 992 ? 2 : 3;
  const fanRadius = isMobile ? 120 : FAN_RADIUS;

  const overlay = document.createElement('div');
  overlay.className = 'photo-fan-overlay';
  document.body.appendChild(overlay);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'photo-fan-close';
  closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  closeBtn.setAttribute('aria-label', 'Close gallery');
  overlay.appendChild(closeBtn);

  const cards = [];
  for (let i = 0; i < N; i++) {
    const card = document.createElement('div');
    card.className = 'fan-card';
    card.style.backgroundImage = `url(${images[i]})`;
    card.style.left = `${originRect.left}px`;
    card.style.top = `${originRect.top}px`;
    card.style.width = `${originRect.width}px`;
    card.style.height = `${originRect.height}px`;
    card.style.zIndex = N - i;

    const label = document.createElement('div');
    label.className = 'fan-card-label';
    label.textContent = images[i].split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    card.appendChild(label);

    overlay.appendChild(card);
    cards.push(card);
  }

  requestAnimationFrame(() => overlay.classList.add('is-open'));

  const cx = vw / 2;
  const cy = vh / 2;

  const tl = gsap.timeline({
    onComplete: () => {
      fanTween = null;
    }
  });

  tl.set(cards, {
    width: CARD_W,
    height: CARD_H,
    left: cx,
    top: cy,
    xPercent: -50,
    yPercent: -50,
    x: 0,
    y: 0,
    scale: 0.8,
    opacity: 0,
  });

  tl.to(cards, {
    opacity: 1,
    scale: 1,
    duration: 0.2,
    ease: 'power2.out',
  });

  cards.forEach((card, i) => {
    const t = N > 1 ? i / (N - 1) : 0.5;
    const angleDeg = FAN_START_ANGLE + t * FAN_ARC;
    const angleRad = angleDeg * (Math.PI / 180);
    const tx = Math.sin(angleRad) * fanRadius;
    const ty = -Math.cos(angleRad) * fanRadius + (i - (N - 1) / 2) * 10;

    tl.to(card, {
      x: tx,
      y: ty,
      rotation: angleDeg,
      duration: 0.65,
      ease: 'power3.out',
    }, `-=0.05`);
  }, 0.04);

  const gap = 16;
  const rows = Math.ceil(N / cols);
  const colCount = Math.min(cols, N);
  const rowWidth = colCount * CARD_W + (colCount - 1) * gap;
  const gridStartX = -(rowWidth / 2) + CARD_W / 2;
  const gridHeight = rows * CARD_H + (rows - 1) * gap;

  tl.to(cards, {
    x: (i) => gridStartX + (i % cols) * (CARD_W + gap),
    y: (i) => Math.floor(i / cols) * (CARD_H + gap) - gridHeight / 2 + CARD_H / 2,
    rotation: 0,
    duration: 0.75,
    ease: 'power3.inOut',
    stagger: 0.025,
  }, '+=0.3');

  tl.fromTo(cards, { scale: 1 }, {
    scale: 1.04,
    duration: 0.2,
    ease: 'power1.out',
    yoyo: true,
    repeat: 1,
  });

  tl.call(() => {
    cards.forEach((c, idx) => {
      c.classList.add('is-settled');
      c.addEventListener('mouseenter', () => {
        gsap.to(c, { scale: 1.05, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      });
      c.addEventListener('mouseleave', () => {
        gsap.to(c, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      });
      c.addEventListener('click', () => {
        openLightbox(images, idx);
      });
    });
  });

  fanTween = tl;
  activeFan = overlay;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('.photo-fan-close')) {
      closeFan();
    }
  });
}

let lightboxState = null;

function openLightbox(images, index) {
  closeLightbox();
  if (!images || !images.length) return;
  const total = images.length;
  const showNav = total > 1;
  const overlay = document.createElement('div');
  overlay.className = 'photo-lightbox';
  overlay.innerHTML = `
    <button class="photo-lightbox-download" aria-label="Download">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </button>
    <button class="photo-lightbox-close" aria-label="Close">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    ${showNav ? '<button class="photo-lightbox-prev" aria-label="Previous"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>' : ''}
    <div class="photo-lightbox-image-wrap">
      <img class="photo-lightbox-image" src="${images[index]}" alt="">
      <div class="photo-lightbox-counter">${index + 1} / ${total}</div>
    </div>
    ${showNav ? '<button class="photo-lightbox-next" aria-label="Next"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>' : ''}
  `;
  document.body.appendChild(overlay);
  lightboxState = { overlay, images, index, total };

  function goTo(i) {
    if (i < 0) i = total - 1;
    if (i >= total) i = 0;
    lightboxState.index = i;
    overlay.querySelector('.photo-lightbox-image').src = images[i];
    overlay.querySelector('.photo-lightbox-counter').textContent = `${i + 1} / ${total}`;
  }

  if (showNav) {
    overlay.querySelector('.photo-lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); goTo(lightboxState.index - 1); });
    overlay.querySelector('.photo-lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); goTo(lightboxState.index + 1); });
  }

  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50 && showNav) goTo(lightboxState.index + (diff > 0 ? 1 : -1));
  }, { passive: true });

  const keyHandler = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (showNav && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      goTo(lightboxState.index + (e.key === 'ArrowRight' ? 1 : -1));
    }
  };
  document.addEventListener('keydown', keyHandler);
  overlay._keyHandler = keyHandler;

  requestAnimationFrame(() => overlay.classList.add('is-open'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('.photo-lightbox-close')) closeLightbox();
  });

  const downloadBtn = overlay.querySelector('.photo-lightbox-download');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const a = document.createElement('a');
      a.href = images[lightboxState.index];
      a.download = images[lightboxState.index].split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
}

function closeLightbox() {
  if (!lightboxState) return;
  const { overlay } = lightboxState;
  lightboxState = null;
  if (overlay._keyHandler) document.removeEventListener('keydown', overlay._keyHandler);
  overlay.classList.remove('is-open');
  setTimeout(() => overlay.remove(), 400);
}

function initGallerySearch() {
  const input = document.querySelector('[data-gallery-search]');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.event-highlight').forEach(el => {
      const title = (el.querySelector('.event-highlight-title')?.textContent || '').toLowerCase();
      const meta = (el.querySelector('.event-highlight-meta')?.textContent || '').toLowerCase();
      const match = !q || title.includes(q) || meta.includes(q);
      el.classList.toggle('is-hidden-search', !match);
    });
  });
}

function initGalleryFan() {
  document.querySelectorAll('.event-highlight').forEach(el => {
    el.addEventListener('click', (e) => {
      const imagesRaw = el.getAttribute('data-event-highlight');
      if (!imagesRaw) return;
      let images;
      try { images = JSON.parse(imagesRaw); } catch { return; }
      if (!images || images.length === 0) return;
      const rect = el.getBoundingClientRect();
      openFan(images, rect);
    });
  });
}

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

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (lightboxState) closeLightbox();
    else closeFan();
  }
});

async function init() {
  const { lenis } = initLenis();

  initInertia();
  initNavbar();
  await initLoader();

  setTimeout(() => {
    document.documentElement.classList.add('fonts-loaded');
  }, 100);

  galleryData = await loadList('gallery', GALLERY_DEFAULTS);
  renderGallery();
  initGallerySearch();
  initSectionHeaders();
  initGalleryFan();

  ScrollTrigger.refresh();
  lenis.emit('scroll');
}

document.addEventListener('DOMContentLoaded', init);
