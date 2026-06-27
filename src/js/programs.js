import { gsap, ScrollTrigger } from './gsap.js';
import { loadList } from './utils/data.js';

const PROGRAMS_DEFAULTS = [];

const PROGRAMS_GRADIENTS = [
  'linear-gradient(135deg, rgba(200,150,62,0.1), rgba(200,150,62,0.03))',
  'linear-gradient(135deg, rgba(196,122,90,0.1), rgba(196,122,90,0.03))',
  'linear-gradient(135deg, rgba(122,138,122,0.1), rgba(122,138,122,0.03))',
  'linear-gradient(135deg, rgba(200,150,62,0.1), rgba(200,150,62,0.03))',
  'linear-gradient(135deg, rgba(196,122,90,0.1), rgba(196,122,90,0.03))',
  'linear-gradient(135deg, rgba(122,138,122,0.1), rgba(122,138,122,0.03))',
];

let programsData = [...PROGRAMS_DEFAULTS];

async function renderPrograms() {
  const container = document.querySelector('[data-programs-container]');
  if (!container) return;
  const items = programsData;
  container.innerHTML = items.map((item, i) => {
    const gradient = PROGRAMS_GRADIENTS[i % PROGRAMS_GRADIENTS.length];
    return `
      <div class="program-card" data-program-card data-inertia-item>
        <h3 class="program-title">${item.title}</h3>
        <p class="program-desc">${item.desc || ''}</p>
        <div class="program-meta">${item.meta || ''}</div>
      </div>
    `;
  }).join('');
}

export async function initPrograms() {
  programsData = await loadList('programs', PROGRAMS_DEFAULTS);
  renderPrograms();
  const cards = document.querySelectorAll('[data-program-card]');
  if (!cards.length) return;
  gsap.fromTo(cards, { y: 60, opacity: 0, scale: 0.95 }, {
    y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: {
      trigger: cards[0].parentElement,
      start: 'top 75%',
      end: 'top 30%',
    }
  });
}
