import { gsap, ScrollTrigger } from './gsap.js';
import { initLenis } from './lenis.js';
import { initNavbar } from './navbar.js';
import { initLoader } from './loader.js';
import { initInertia } from './utils/inertia.js';
import { initFootballPitch, getSquad, loadSquad } from './football.js';
import { loadList, filterList } from './utils/data.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TEAM_NAME = 'St. Monica';

function parseGoals(notes) {
  if (!notes) return [];
  return notes.split(',').map(s => s.trim()).filter(Boolean).map(part => {
    const isPen = part.includes('(pen)');
    const isMissed = part.includes('missed');
    const clean = part.replace(/\(pen\)/g, '').replace(/missed/g, '').trim();
    const match = clean.match(/^(.+?)\s+(\d+)'?$/);
    if (!match) return { name: clean, minute: '', isPenalty: isPen, isMissed: isMissed };
    return { name: match[1].trim(), minute: match[2], isPenalty: isPen, isMissed: isMissed };
  });
}

let footballResults = [];
let footballStats = { matches: 24, goals: 16, cleanSheets: 8, trophies: 3 };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getResultClass(s1, s2, team1) {
  if (s1 == null || s2 == null) return '';
  const isStMonica = team1 === TEAM_NAME;
  const stScore = isStMonica ? s1 : s2;
  const oppScore = isStMonica ? s2 : s1;
  if (stScore > oppScore) return 'is-win';
  if (stScore < oppScore) return 'is-loss';
  return 'is-draw';
}

function renderGoals(detail) {
  if (!detail) return '';
  return parseGoals(detail).map(g => {
    const extra = g.isPenalty ? ' result-goal--penalty' : g.isMissed ? ' result-goal--missed' : '';
    const label = g.isPenalty ? ' pen' : g.isMissed ? ' missed pen' : '';
    return `<div class="result-goal${extra}">
      <span class="result-goal-name">${g.name}</span>
      ${g.minute ? `<span class="result-goal-min">${g.minute}'</span>` : ''}
      ${label ? `<span class="result-goal-label">${label}</span>` : ''}
    </div>`;
  }).join('');
}

function renderResult(match) {
  const s1 = match.score1, s2 = match.score2;
  const cls = getResultClass(s1, s2, match.team1);
  const date = formatDate(match.date);
  const homeGoals = renderGoals(match.notes);
  const awayGoals = renderGoals(match.notes2);

  const detail = (homeGoals || awayGoals) ? `
    <div class="result-detail">
      <div class="result-scorers">${homeGoals || ''}</div>
      ${homeGoals && awayGoals ? '<div class="result-scorers-divider"></div>' : ''}
      <div class="result-scorers">${awayGoals || ''}</div>
    </div>` : '';

  return `
    <div class="result-item ${cls}">
      <div class="result-competition">${match.competition || 'Match'}</div>
      <div class="result-teams">
        <span class="result-team">${match.team1}</span>
        <span class="result-score">${s1} - ${s2}</span>
        <span class="result-team">${match.team2}</span>
      </div>
      <div class="result-date">${date}</div>
      ${detail}
    </div>`;
}

function renderResults() {
  const list = document.querySelector('[data-results-list]');
  if (!list) return;
  const results = footballResults;
  if (results.length) {
    list.innerHTML = results.map(renderResult).join('');
  } else {
    list.innerHTML = '<div class="results-empty" style="text-align:center;padding:2rem;color:var(--text-muted);">No results recorded yet.</div>';
  }
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

function initCountUp() {
  const stats = footballStats;
  const statLabels = ['matches', 'goals', 'cleanSheets', 'trophies'];
  document.querySelectorAll('[data-football-stat]').forEach((el, i) => {
    const key = statLabels[i] || 'matches';
    const target = stats[key] || 0;

    gsap.fromTo(el, {
      textContent: 0,
      snap: { textContent: 1 }
    }, {
      textContent: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el.closest('[data-football-stats]') || el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: function () {
        el.textContent = Math.round(parseFloat(el.textContent));
      }
    });
  });
}

function initResultsToggle() {
  const btn = document.querySelector('[data-results-toggle]');
  const list = document.querySelector('[data-results-list]');
  const icon = btn?.querySelector('.results-toggle-icon');
  const text = btn?.querySelector('[data-results-toggle-text]');
  if (!btn || !list) return;

  btn.addEventListener('click', () => {
    const isOpen = list.style.display !== 'none';

    if (!isOpen) {
      list.style.display = '';
      gsap.set(list, { height: 0, opacity: 0, overflow: 'hidden' });
      const h = list.scrollHeight;
      gsap.to(list, {
        height: h,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          gsap.set(list, { height: '', overflow: '', clearProps: 'all' });
          gsap.fromTo('.result-item', { x: -30, opacity: 0 }, {
            x: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out'
          });
          gsap.fromTo('.result-detail .result-goal', { y: 8, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.35, stagger: 0.03, ease: 'power2.out',
            delay: 0.2
          });
        }
      });
      if (icon) icon.classList.add('is-open');
      if (text) text.textContent = 'Hide Results';
    } else {
      gsap.to(list, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          list.style.display = 'none';
          gsap.set(list, { height: '', opacity: '', overflow: '' });
        }
      });
      if (icon) icon.classList.remove('is-open');
      if (text) text.textContent = 'View Match Results';
    }
  });
}

function initBallAnimation() {
  return new Promise(resolve => {
    const container = document.querySelector('[data-fp-ball-container]');
    const ball = document.querySelector('[data-fp-ball]');
    const shadow = document.querySelector('[data-fp-ball-shadow]');
    if (!container || !ball) { resolve(); return; }

    gsap.set(container, { display: 'flex' });
    gsap.set(ball, { x: -200, y: 0, scaleX: 1, scaleY: 1 });
    gsap.set(shadow, { x: -200, scale: 1, opacity: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(container, {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(container, { display: 'none' });
            resolve();
          }
        });
      }
    });

    // Kick — ball flies in with big arc
    tl.to(ball, { x: '20vw', y: -360, rotation: '+=140', duration: 0.55, ease: 'power3.out' })
      .to(shadow, { x: '20vw', scale: 0.3, opacity: 0.25, duration: 0.55, ease: 'power3.out' }, 0)

    // Bounce 1
    tl.to(ball, { y: 0, rotation: '+=60', duration: 0.4, ease: 'power2.in',
      onComplete: () => gsap.timeline()
        .to(ball, { scaleX: 1.25, scaleY: 0.78, duration: 0.05 })
        .to(ball, { scaleX: 1, scaleY: 1, duration: 0.15, ease: 'power2.out' })
    })
      .to(shadow, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.in' })

    // Bounce 2
    tl.to(ball, { x: '35vw', y: -240, rotation: '+=130', duration: 0.4, ease: 'power2.out' })
      .to(shadow, { x: '35vw', scale: 0.45, opacity: 0.35, duration: 0.4, ease: 'power2.out' }, '-=0.4')
      .to(ball, { y: 0, rotation: '+=50', duration: 0.32, ease: 'power2.in',
        onComplete: () => gsap.timeline()
          .to(ball, { scaleX: 1.2, scaleY: 0.82, duration: 0.04 })
          .to(ball, { scaleX: 1, scaleY: 1, duration: 0.12, ease: 'power2.out' })
      })
      .to(shadow, { scale: 1, opacity: 1, duration: 0.32, ease: 'power2.in' })

    // Bounce 3
    tl.to(ball, { x: '47vw', y: -155, rotation: '+=130', duration: 0.32, ease: 'power2.out' })
      .to(shadow, { x: '47vw', scale: 0.55, opacity: 0.45, duration: 0.32, ease: 'power2.out' }, '-=0.32')
      .to(ball, { y: 0, rotation: '+=45', duration: 0.26, ease: 'power2.in',
        onComplete: () => gsap.timeline()
          .to(ball, { scaleX: 1.15, scaleY: 0.86, duration: 0.04 })
          .to(ball, { scaleX: 1, scaleY: 1, duration: 0.1, ease: 'power2.out' })
      })
      .to(shadow, { scale: 1, opacity: 1, duration: 0.26, ease: 'power2.in' })

    // Bounce 4
    tl.to(ball, { x: '57vw', y: -95, rotation: '+=120', duration: 0.26, ease: 'power2.out' })
      .to(shadow, { x: '57vw', scale: 0.65, opacity: 0.55, duration: 0.26, ease: 'power2.out' }, '-=0.26')
      .to(ball, { y: 0, rotation: '+=40', duration: 0.2, ease: 'power2.in',
        onComplete: () => gsap.timeline()
          .to(ball, { scaleX: 1.12, scaleY: 0.88, duration: 0.03 })
          .to(ball, { scaleX: 1, scaleY: 1, duration: 0.08, ease: 'power2.out' })
      })
      .to(shadow, { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.in' })

    // Bounce 5
    tl.to(ball, { x: '65vw', y: -55, rotation: '+=110', duration: 0.2, ease: 'power2.out' })
      .to(shadow, { x: '65vw', scale: 0.75, opacity: 0.65, duration: 0.2, ease: 'power2.out' }, '-=0.2')
      .to(ball, { y: 0, rotation: '+=35', duration: 0.16, ease: 'power2.in',
        onComplete: () => gsap.timeline()
          .to(ball, { scaleX: 1.1, scaleY: 0.9, duration: 0.03 })
          .to(ball, { scaleX: 1, scaleY: 1, duration: 0.07, ease: 'power2.out' })
      })
      .to(shadow, { scale: 1, opacity: 1, duration: 0.16, ease: 'power2.in' })

    // Bounce 6 — tiny
    tl.to(ball, { x: '71vw', y: -28, rotation: '+=100', duration: 0.16, ease: 'power2.out' })
      .to(shadow, { x: '71vw', scale: 0.85, opacity: 0.75, duration: 0.16, ease: 'power2.out' }, '-=0.16')
      .to(ball, { y: 0, rotation: '+=30', duration: 0.14, ease: 'power2.in',
        onComplete: () => gsap.timeline()
          .to(ball, { scaleX: 1.08, scaleY: 0.92, duration: 0.03 })
          .to(ball, { scaleX: 1, scaleY: 1, duration: 0.06, ease: 'power2.out' })
      })
      .to(shadow, { scale: 1, opacity: 1, duration: 0.14, ease: 'power2.in' })

    // Roll back to center and stop
    tl.to(ball, { x: '50vw', y: 0, rotation: '+=80', duration: 0.6, ease: 'power3.out' })
      .to(shadow, { x: '50vw', scale: 0.9, opacity: 0.8, duration: 0.6, ease: 'power3.out' }, '-=0.6');
  });
}

function renderLineup() {
  const container = document.querySelector('[data-fp-lineup-list]');
  if (!container) return;
  const squad = getSquad();
  const groups = [
    { label: 'Goalkeeper', ids: ['gk'] },
    { label: 'Defenders', ids: ['rb', 'cb1', 'cb2', 'lb'] },
    { label: 'Midfielders', ids: ['cm1', 'cm2', 'cm3'] },
    { label: 'Forwards', ids: ['lw', 'st', 'rw'] },
  ];
  container.innerHTML = groups.map(g => `
    <div class="fp-lineup-group">
      <div class="fp-lineup-group-label">${g.label}</div>
      ${g.ids.map(id => {
        const p = squad.find(s => s.id === id);
        if (!p) return '';
        return `<div class="fp-lineup-player" data-lineup="${p.id}">
          <span class="fp-lineup-num">${p.num}</span>
          <span class="fp-lineup-name">${p.name}</span>
          <span class="fp-lineup-pos">${p.label}</span>
        </div>`;
      }).join('')}
    </div>
  `).join('');
}

function renderCoach(coach) {
  const box = document.querySelector('[data-fp-coach]');
  if (!box) return;
  if (!coach || (!coach.name && !coach.img)) { box.style.display = 'none'; return; }
  const img = document.querySelector('[data-fp-coach-img]');
  const name = document.querySelector('[data-fp-coach-name]');
  if (img) img.style.backgroundImage = coach.img ? `url(${coach.img})` : '';
  if (name) name.textContent = coach.name || 'Unknown';
  box.style.display = '';
}

async function init() {
  const { lenis } = initLenis();

  initInertia();
  initNavbar();
  await initLoader();

  setTimeout(() => {
    document.documentElement.classList.add('fonts-loaded');
  }, 100);

  await initBallAnimation();

  [footballResults, footballStats] = await Promise.all([
    filterList('sports', r => r.sport === 'football'),
    loadList('football_stats', { matches: 24, goals: 16, cleanSheets: 8, trophies: 3 }),
  ]);
  await loadSquad();
  const coach = await loadList('football_coach', null);
  renderCoach(coach);

  const overlay = document.querySelector('[data-fp-overlay]');
  if (overlay) {
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
  }

  renderLineup();
  initFootballPitch();
  renderResults();
  initSectionHeaders();
  initCountUp();
  initResultsToggle();

  ScrollTrigger.refresh();
  lenis.emit('scroll');
}

document.addEventListener('DOMContentLoaded', init);
