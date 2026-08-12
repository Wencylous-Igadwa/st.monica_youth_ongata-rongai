import { gsap } from './gsap.js';
import { loadList } from './utils/data.js';

const SQUAD_DEFAULTS = [
  { id: 'gk',  name: 'Daniel',   num: 1,  label: 'GK', group: 'gk',  x: 50, y: 92, color: '#4a7c59', img: '/images/koh-01.jpeg',     position: 'GK',  rating: 84, stats: { diving: 82, handling: 78, kicking: 75, reflexes: 85, speed: 60, positioning: 80 } },
  { id: 'rb',  name: 'James',    num: 2,  label: 'RB', group: 'def', x: 82, y: 78, color: '#6b5d4a', img: '/images/koh-02.jpeg',     position: 'RB',  rating: 78, stats: { pace: 82, shooting: 62, passing: 72, dribbling: 70, defending: 76, physical: 74 } },
  { id: 'cb1', name: 'Peter',    num: 4,  label: 'CB', group: 'def', x: 38, y: 82, color: '#6b5d4a', img: '/images/koh-v-2.jpeg',    position: 'CB',  rating: 80, stats: { pace: 68, shooting: 55, passing: 70, dribbling: 60, defending: 85, physical: 82 } },
  { id: 'cb2', name: 'John',     num: 5,  label: 'CB', group: 'def', x: 62, y: 82, color: '#6b5d4a', img: '/images/cross-2.jpeg',   position: 'CB',  rating: 77, stats: { pace: 65, shooting: 52, passing: 68, dribbling: 58, defending: 82, physical: 80 } },
  { id: 'lb',  name: 'Mark',     num: 3,  label: 'LB', group: 'def', x: 18, y: 78, color: '#6b5d4a', img: '/images/st-monica-1.jpeg', position: 'LB',  rating: 76, stats: { pace: 80, shooting: 58, passing: 70, dribbling: 68, defending: 74, physical: 72 } },
  { id: 'cm1', name: 'Luke',     num: 8,  label: 'CM',  group: 'mid', x: 28, y: 48, color: '#2b5c8a', img: '/images/mary_jesus_01.jpeg', position: 'CM',  rating: 82, stats: { pace: 72, shooting: 75, passing: 82, dribbling: 78, defending: 68, physical: 76 } },
  { id: 'cm2', name: 'Andrew',   num: 6,  label: 'CDM', group: 'mid', x: 50, y: 62, color: '#2b5c8a', img: '/images/index.jpeg',    position: 'CDM', rating: 79, stats: { pace: 70, shooting: 68, passing: 80, dribbling: 74, defending: 76, physical: 78 } },
  { id: 'cm3', name: 'Thomas',   num: 10, label: 'CM',  group: 'mid', x: 72, y: 48, color: '#2b5c8a', img: '/images/koh-01.jpeg',     position: 'CM',  rating: 81, stats: { pace: 74, shooting: 78, passing: 84, dribbling: 80, defending: 64, physical: 72 } },
  { id: 'lw',  name: 'Samuel',   num: 11, label: 'LW', group: 'fwd', x: 18, y: 25, color: '#c8963e', img: '/images/koh-02.jpeg',     position: 'LW/ST', rating: 83, stats: { pace: 88, shooting: 80, passing: 74, dribbling: 84, defending: 38, physical: 68 } },
  { id: 'st',  name: 'Joseph',   num: 9,  label: 'ST', group: 'fwd', x: 50, y: 18, color: '#c8963e', img: '/images/koh-v-2.jpeg',    position: 'ST',  rating: 85, stats: { pace: 82, shooting: 86, passing: 70, dribbling: 78, defending: 42, physical: 80 } },
  { id: 'rw',  name: 'David',    num: 7,  label: 'RW', group: 'fwd', x: 82, y: 25, color: '#c8963e', img: '/images/cross-2.jpeg',   position: 'RW',  rating: 80, stats: { pace: 86, shooting: 76, passing: 72, dribbling: 82, defending: 36, physical: 66 } },
];

let squadData = null;

export async function loadSquad() {
  const raw = await loadList('football_squad', SQUAD_DEFAULTS);
  if (Array.isArray(raw) && raw.length === 11) {
    squadData = raw.map((p, i) => ({ ...SQUAD_DEFAULTS[i], ...p, stats: { ...SQUAD_DEFAULTS[i].stats, ...(p.stats || {}) } }));
  } else {
    squadData = SQUAD_DEFAULTS;
  }
  return squadData;
}

export function getSquad() {
  return squadData || SQUAD_DEFAULTS;
}

const GROUPS = ['gk', 'def', 'mid', 'fwd'];

const GROUP_LABELS = {
  gk: 'Goalkeeper',
  def: 'Defenders',
  mid: 'Midfielders',
  fwd: 'Forwards',
};

function tween(target, vars) {
  return new Promise(resolve => {
    gsap.to(target, { ...vars, onComplete: resolve });
  });
}

function makeBigCard(player) {
  const c = document.createElement('div');
  c.className = 'fp-card';
  c.innerHTML = `
    <div class="fp-card-img" style="background-image:url(${player.img})"></div>
    <div class="fp-card-overlay"></div>
    <div class="fp-card-body">
      <div class="fp-card-position">${player.label}</div>
      <div class="fp-card-name">${player.name}</div>
      <div class="fp-card-number">#${player.num}</div>
    </div>
  `;
  return c;
}

function makePitchCard(player) {
  const el = document.createElement('div');
  el.className = 'pitch-card';
  el.dataset.player = player.id;
  el.style.cssText = `left: ${player.x}%; top: ${player.y}%;`;
  el.innerHTML = `
    <div class="pitch-card-img" style="background-image:url(${player.img})"></div>
    <div class="pitch-card-label">${player.label}</div>
  `;
  return el;
}

async function showGroup(group, revealInner, pitchPlayers, allPitchCards) {
  const squad = getSquad();
  const players = squad.filter(p => p.group === group);
  const bigCards = players.map(p => makeBigCard(p));

  revealInner.innerHTML = '';
  bigCards.forEach(c => revealInner.appendChild(c));

  gsap.set(bigCards, { scale: 0, opacity: 0, x: 0, y: 0 });

  // Show big cards
  await tween(bigCards, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.7)' });

  // Hold on screen
  await tween({}, { duration: 5 });

  // Calculate fly-to positions on pitch
  const targets = players.map((p, i) => {
    const dot = allPitchCards[squad.indexOf(p)];
    const card = bigCards[i];
    const dr = dot.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    return {
      card,
      pitchCard: dot,
      dx: dr.left + dr.width / 2 - (cr.left + cr.width / 2),
      dy: dr.top + dr.height / 2 - (cr.top + cr.height / 2),
    };
  });

  // Fly big cards to pitch positions
  await Promise.all(targets.map(t =>
    tween(t.card, { x: t.dx, y: t.dy, scale: 0.25, opacity: 0.5, duration: 0.8, ease: 'power3.inOut' })
  ));

  // Show pitch mini cards with the same image
  await tween(
    targets.map(t => t.pitchCard),
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }
  );
}

export function initFootballPitch() {
  const squad = getSquad();
  const overlay = document.querySelector('[data-fp-overlay]');
  const startBtn = document.querySelector('[data-fp-start]');
  const revealContainer = document.querySelector('[data-fp-reveal]');
  const revealInner = document.querySelector('[data-fp-reveal-inner]');
  const pitchPlayers = document.querySelector('[data-pitch-players]');
  const pitchSection = document.querySelector('[data-fp-pitch-section]');

  if (!startBtn || !overlay || !pitchPlayers) return;

  gsap.set(pitchSection, { autoAlpha: 0 });

  const allPitchCards = squad.map(p => {
    const pc = makePitchCard(p);
    pitchPlayers.appendChild(pc);
    gsap.set(pc, { scale: 0, opacity: 0 });
    return pc;
  });

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;

    await tween(overlay, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' });
    overlay.style.display = 'none';
    gsap.set(pitchSection, { autoAlpha: 1 });

    for (const group of GROUPS) {
      revealContainer.style.opacity = '1';
      revealContainer.style.visibility = 'visible';
      await showGroup(group, revealInner, pitchPlayers, allPitchCards);
      revealContainer.style.opacity = '0';
      revealContainer.style.visibility = 'hidden';
    }

    // final pulse on pitch cards
    await tween(
      allPitchCards,
      { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.out' }
    );

    // clear GSAP transforms so CSS hover/scale works
    allPitchCards.forEach(pc => gsap.set(pc, { clearProps: 'transform' }));

    // attach FIFA card click handlers to settled pitch cards
    allPitchCards.forEach((pc, i) => {
      pc.addEventListener('click', () => showFifaCard(getSquad()[i]));
    });
  });
}

const OUTFIELD_STATS = [
  { key: 'pace', label: 'PAC' },
  { key: 'shooting', label: 'SHO' },
  { key: 'passing', label: 'PAS' },
  { key: 'dribbling', label: 'DRI' },
  { key: 'defending', label: 'DEF' },
  { key: 'physical', label: 'PHY' },
];

const GK_STATS = [
  { key: 'diving', label: 'DIV' },
  { key: 'handling', label: 'HAN' },
  { key: 'kicking', label: 'KIC' },
  { key: 'reflexes', label: 'REF' },
  { key: 'speed', label: 'SPD' },
  { key: 'positioning', label: 'POS' },
];

function getRatingColor(rating) {
  if (rating >= 90) return '#e8c84a';
  if (rating >= 80) return '#2b5c8a';
  if (rating >= 70) return '#4a7c59';
  return '#6b5d4a';
}

function closeFifaCard() {
  const overlay = document.querySelector('.fifa-card-overlay');
  if (overlay) overlay.remove();
  if (closeFifaCardHandler) {
    document.removeEventListener('keydown', closeFifaCardHandler);
    closeFifaCardHandler = null;
  }
}

function showFifaCard(player) {
  closeFifaCard();
  const statsList = player.group === 'gk' ? GK_STATS : OUTFIELD_STATS;
  const overlay = document.createElement('div');
  overlay.className = 'fifa-card-overlay';
  overlay.innerHTML = `
      <div class="fifa-card">
      <div class="fifa-card-inner">
        <div class="fifa-card-top">
          <div class="fifa-card-badge">
            <span class="fifa-card-rating">${player.rating}</span>
            <span class="fifa-card-pos">${player.position || player.label}</span>
          </div>
        </div>
        <div class="fifa-card-img-wrap"><img src="${player.img}" alt="${player.name}"></div>
        <div class="fifa-card-body">
          <div class="fifa-card-name">${player.name.toUpperCase()}</div>
          <div class="fifa-card-stats">
          ${statsList.map(s => {
            const val = player.stats?.[s.key] ?? 50;
            return `
              <div class="fifa-stat">
                <span class="fifa-stat-label">${s.label}</span>
                <div class="fifa-stat-bar">
                  <div class="fifa-stat-fill" style="width: ${val}%"></div>
                </div>
                <span class="fifa-stat-value">${val}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      </div>
      <button class="fifa-card-close">&times;</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.fifa-card-close').addEventListener('click', closeFifaCard);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeFifaCard(); });
  document.addEventListener('keydown', closeFifaCardHandler = (e) => { if (e.key === 'Escape') closeFifaCard(); });
}

let closeFifaCardHandler = null;
