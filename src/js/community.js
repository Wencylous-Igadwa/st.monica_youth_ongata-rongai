import { gsap, ScrollTrigger } from './gsap.js';
import { initLenis } from './lenis.js';
import { initNavbar } from './navbar.js';
import { initLoader } from './loader.js';
import { initInertia } from './utils/inertia.js';
import { loadList } from './utils/data.js';

const LEADERSHIP_DEFAULTS = [
  { id: 'chair', name: 'Esther Nyambura', role: 'Chairperson', initials: 'EN', color: '#c8963e', img: '', quote: '"To be a youth is to be a vessel of hope, carrying Christ\'s light into every corner of our community."' },
  { id: 'vice',  name: 'Peter Kimani',   role: 'Vice Chairperson', initials: 'PK', color: '#8b6914', img: '', quote: '"Leadership is not about the title — it\'s about lifting others up and walking alongside them."' },
  { id: 'sec',   name: 'Grace Akinyi',   role: 'Secretary', initials: 'GA', color: '#7a8a7a', img: '', quote: '"Every meeting, every note, every detail — it\'s all in service of God\'s work among us."' },
  { id: 'asst',  name: 'David Mwangi',   role: 'Assistant Secretary', initials: 'DM', color: '#9a8b78', img: '', quote: '"Faith isn\'t just what we believe — it\'s what we do when no one is watching."' },
  { id: 'treas', name: 'Sarah Wanjiku',  role: 'Treasurer', initials: 'SW', color: '#c47a5a', img: '', quote: '"Stewardship is a heart issue — we give because God first gave to us."' },
  { id: 'org',   name: 'Michael Omondi', role: 'Organizing Secretary', initials: 'MO', color: '#2b5c8a', img: '', quote: '"Whether it\'s an event or a mission, good planning creates space for grace to move."' },
];

const FAMILIES_DEFAULTS = [
  { name: 'St. Francis Family', sub: 'The joyful servants', color: '#e8b84c', members: ['Kevin Omondi', 'Mary Wanjiku', 'Peter Kamau', 'Grace Njeri', 'David Mwangi'] },
  { name: 'St. Clare Family', sub: 'The prayerful hearts', color: '#6aab6a', members: ['Sarah Akinyi', 'John Njoroge', 'Esther Wambui', 'Michael Otieno', 'Rose Nyambura'] },
  { name: 'St. Thérèse Family', sub: 'The little flowers', color: '#c47a5a', members: ['James Kiprop', 'Agnes Wairimu', 'Patrick Mutua', 'Faith Chepkirui', 'Samuel Ochieng\''] },
  { name: 'St. John Paul II Family', sub: 'The faithful witnesses', color: '#8a7ab8', members: ['Catherine Muthoni', 'Joseph Wekesa', 'Dorcas Anyango', 'Paul Kiplagat', 'Elizabeth Njoki'] },
  { name: 'St. Michael Family', sub: 'The courageous warriors', color: '#d4a06a', members: ['Daniel Macharia', 'Monica Akumu', 'Stephen Kariuki', 'Margaret Wanjiru', 'Christopher Langat'] },
];

let leadershipData = [...LEADERSHIP_DEFAULTS];
let familiesData = [...FAMILIES_DEFAULTS];

function renderLeadership() {
  const grid = document.querySelector('[data-leadership-grid]');
  if (!grid) return;
  const leaders = leadershipData;
  grid.innerHTML = leaders.map(l => {
    const initials = l.initials || l.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `
    <div class="leader-card" data-leader="${l.id}">
      <div class="leader-card-inner">
        <div class="leader-card-front">
          <div class="leader-avatar" style="--avatar-color: ${l.color};">
            ${l.img
              ? `<img class="leader-avatar-img" src="${l.img}" alt="${l.name}">`
              : `<span class="leader-avatar-initials">${initials}</span>`
            }
          </div>
          <div class="leader-card-body">
            <h3 class="leader-name">${l.name}</h3>
            <span class="leader-role">${l.role}</span>
          </div>
        </div>
        <div class="leader-card-back" style="--avatar-color: ${l.color};">
          <p class="leader-quote">${l.quote}</p>
          <span class="leader-quote-author">— ${l.name}</span>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

let activeFruit = null;

async function initLeadershipReveal() {
  leadershipData = await loadList('leadership', LEADERSHIP_DEFAULTS);
  renderLeadership();
  const cards = document.querySelectorAll('.leader-card');
  if (!cards.length) return;

  gsap.fromTo(cards, {
    y: 60, opacity: 0, scale: 0.92,
  }, {
    y: 0, opacity: 1, scale: 1,
    duration: 0.8, ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: '.leadership-grid',
      start: 'top 82%',
      end: 'bottom 40%',
      toggleActions: 'play none none none',
    }
  });

  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });
}

function initTreeAnimation() {
  const treeWrap = document.querySelector('[data-tree-wrap]');
  const treeSvg = document.querySelector('[data-tree-svg]');
  const trunkPaths = document.querySelectorAll('.tree-trunk-path');
  const branchPaths = document.querySelectorAll('.tree-branches path');
  const foliageGroups = document.querySelectorAll('.tree-foliage');
  const fruits = document.querySelectorAll('[data-family-fruit]');
  const hint = document.querySelector('[data-tree-hint]');

  if (!treeWrap) return;

  gsap.set(trunkPaths, { autoAlpha: 0 });
  gsap.set(branchPaths, { autoAlpha: 0 });
  gsap.set(foliageGroups, { autoAlpha: 0, scale: 0.5 });
  gsap.set(fruits, { autoAlpha: 0, scale: 0.2 });

  branchPaths.forEach(p => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: treeWrap,
      start: 'top 85%',
      end: 'top 25%',
      toggleActions: 'play none none none',
    }
  });

  tl.to(trunkPaths, { autoAlpha: 1, duration: 1.5, ease: 'power2.out' }, 0);
  tl.to(branchPaths, {
    autoAlpha: 1, strokeDashoffset: 0, duration: 1.8, ease: 'power2.out', stagger: 0.12,
  }, 0.6);
  tl.to(foliageGroups, {
    autoAlpha: 1, scale: 1, duration: 1.4, ease: 'back.out(1.4)', stagger: 0.08,
  }, '-=0.4');
  tl.to(fruits, {
    autoAlpha: 1, scale: 1, duration: 1.2, ease: 'back.out(3)', stagger: 0.15,
  }, '-=0.3');
  tl.to(fruits, {
    y: -4, rotation: (i) => (i % 2 === 0 ? 3 : -3),
    duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3,
  }, '+=0.4');
  tl.fromTo(hint, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
}

function openFamilyModal(index) {
  const modal = document.querySelector('[data-family-modal]');
  const overlay = document.querySelector('[data-family-modal-overlay]');
  const card = document.querySelector('[data-family-modal-card]');
  const badge = document.querySelector('[data-family-modal-badge]');
  const title = document.querySelector('[data-family-modal-title]');
  const sub = document.querySelector('[data-family-modal-sub]');
  const list = document.querySelector('[data-family-modal-list]');
  const family = familiesData[index];
  if (!modal || !family) return;

  if (activeFruit !== null) {
    closeFamilyModal(() => openFamilyModal(index));
    return;
  }

  badge.textContent = `Family ${index + 1}`;
  badge.style.background = family.color;
  title.textContent = family.name;
  sub.textContent = family.sub;
  list.innerHTML = family.members.map(m => `<li>${m}</li>`).join('');

  gsap.set(modal, { display: 'flex' });
  gsap.set(overlay, { opacity: 0 });
  gsap.set(card, { opacity: 0, y: 40, scale: 0.95 });

  const tl = gsap.timeline();
  tl.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });
  tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }, '-=0.1');

  const items = list.querySelectorAll('li');
  if (items.length) {
    gsap.set(items, { x: -20, opacity: 0 });
    tl.to(items, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.06 }, '-=0.1');
  }

  activeFruit = index;
}

function closeFamilyModal(callback) {
  const modal = document.querySelector('[data-family-modal]');
  const overlay = document.querySelector('[data-family-modal-overlay]');
  const card = document.querySelector('[data-family-modal-card]');

  if (!modal || activeFruit === null) {
    if (callback) callback();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(modal, { display: 'none' });
      activeFruit = null;
      if (callback) callback();
    }
  });
  tl.to(card, { opacity: 0, y: 30, scale: 0.95, duration: 0.25, ease: 'power2.in' });
  tl.to(overlay, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
}

function initFruitClicks() {
  const fruits = document.querySelectorAll('[data-family-fruit]');
  fruits.forEach(fruit => {
    fruit.addEventListener('click', () => {
      const idx = parseInt(fruit.getAttribute('data-family'), 10);
      if (isNaN(idx)) return;
      gsap.fromTo(fruit, { scale: 1 }, {
        scale: 1.15, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1,
      });
      openFamilyModal(idx);
    });
  });
}

function initModalControls() {
  const closeBtn = document.querySelector('[data-family-modal-close]');
  const overlay = document.querySelector('[data-family-modal-overlay]');
  if (closeBtn) closeBtn.addEventListener('click', closeFamilyModal);
  if (overlay) overlay.addEventListener('click', closeFamilyModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.querySelector('.leader-card.is-flipped')) {
        document.querySelectorAll('.leader-card.is-flipped').forEach(c => c.classList.remove('is-flipped'));
      } else {
        closeFamilyModal();
      }
    }
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
    const desc = el.querySelector('.section-desc');
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
    if (desc) {
      gsap.fromTo(desc, { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.2,
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' }
      });
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
  familiesData = await loadList('families', FAMILIES_DEFAULTS);
  initLeadershipReveal();
  initTreeAnimation();
  initFruitClicks();
  initModalControls();

  ScrollTrigger.refresh();
  lenis.emit('scroll');
}

document.addEventListener('DOMContentLoaded', init);
