import { gsap, ScrollTrigger } from './gsap.js';
import { initLenis } from './lenis.js';
import { initNavbar } from './navbar.js';
import { initLoader } from './loader.js';
import { initInertia } from './utils/inertia.js';
import { initCalendarButtons } from './calendar.js';
import { loadList } from './utils/data.js';
import { requireAuth } from './auth-gate.js';

const EVENT_DEFAULTS = [];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let eventsData = [...EVENT_DEFAULTS];

function parseTimeTo24h(timeStr) {
  if (!timeStr) return '00:00';
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return '00:00';
  let h = parseInt(m[1]);
  const min = m[2] || '00';
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${min}`;
}

function renderCard(event) {
  const dateObj = new Date(event.date + 'T' + (event.time ? parseTimeTo24h(event.time) : '00:00'));
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = MONTHS[dateObj.getMonth()];
  const dateAttr = event.date + 'T' + (event.time ? parseTimeTo24h(event.time) : '00:00');
  const btnLabel = event.title.toLowerCase().includes('retreat') ? 'Register' :
    event.title.toLowerCase().includes('service') ? 'Join' : 'RSVP';
  const rsvpLabel = btnLabel === 'Register' ? 'Confirm Registration' :
    btnLabel === 'Join' ? 'Confirm Participation' : 'Confirm Attendance';
  const startMs = dateObj.getTime();
  const durationMs = (parseFloat(event.duration) || 2) * 60 * 60 * 1000;
  const isFinished = Date.now() > startMs + durationMs;

  const frontActions = isFinished
    ? `<span class="event-card-finished">Event Ended</span>`
    : `<div style="display:flex;gap:0.5em;flex-wrap:wrap;justify-content:center;">
        <button class="button button-sm event-card-btn" data-flip-btn>${btnLabel}</button>
        <button class="event-card-calendar" aria-label="Add to Calendar" title="Add to Google Calendar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </button>
      </div>`;

  const backActions = isFinished
    ? `<span class="event-card-finished">Event Ended</span>`
    : `<div style="display:flex;gap:0.5em;flex-wrap:wrap;justify-content:center;">
        <button class="button button-sm event-card-back-rsvp" data-flip-rsvp>${rsvpLabel}</button>
        <button class="event-card-calendar" aria-label="Add to Calendar" title="Add to Google Calendar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </button>
      </div>`;

  return `
    <div class="event-card" data-event-id="${event.id}" data-event-status="${event.status || ''}" data-event-title="${event.title}" data-event-date="${dateAttr}" data-event-duration="${event.duration || 2}" data-event-fee="0">
      <div class="event-card-inner">
        <div class="event-card-front">
          <div class="event-card-image">
            <img src="${event.image || '/images/koh-01.jpeg'}" alt="${event.title}" loading="lazy">
            <div class="event-card-image-overlay"></div>
            <div class="event-date-badge">
              <span class="event-date-day">${day}</span>
              <span class="event-date-month">${month}</span>
            </div>
            <div class="event-card-icon">✝</div>
          </div>
          <div class="event-card-body">
            <div class="event-card-ornament"></div>
            <div class="event-card-meta"><span>${event.time || ''}</span><span>${event.location || ''}</span></div>
            <h3 class="event-card-title">${event.title}</h3>
            <p class="event-card-desc">${event.description || ''}</p>
            <div class="event-card-divider"></div>
            <div class="event-card-actions">
              ${frontActions}
            </div>
          </div>
        </div>
        <div class="event-card-back">
          <div class="event-card-back-body">
            <button class="event-card-back-close" data-flip-close aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="event-card-back-icon">✝</div>
            <h3 class="event-card-back-title">${event.title}</h3>
            <div class="event-card-back-meta">
              <span>${month} ${day} · ${event.time || ''}</span>
              <span>${event.location || ''}</span>
            </div>
            <div class="event-card-back-divider"></div>
            <p class="event-card-back-desc">${event.description || ''}</p>
            <div class="event-card-back-actions">
              ${backActions}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

async function renderEvents() {
  const container = document.querySelector('[data-events-container]');
  if (!container) return;
  const events = eventsData;
  container.innerHTML = events.map(renderCard).join('');
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

function getEventStatus(card) {
  const dateStr = card.dataset.eventDate;
  if (!dateStr) return 'finished';
  const start = new Date(dateStr);
  const now = new Date();
  const durationMs = (parseFloat(card.dataset.eventDuration) || 2) * 60 * 60 * 1000;
  const end = new Date(start.getTime() + durationMs);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'finished';
}

function initEventFilter() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  const cards = () => document.querySelectorAll('.event-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      cards().forEach(card => {
        if (filter === 'all') {
          card.classList.remove('is-hidden');
        } else {
          const status = getEventStatus(card);
          card.classList.toggle('is-hidden', status !== filter);
        }
      });
    });
  });
}

function initCardFlips() {
  document.querySelectorAll('[data-flip-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.event-card');
      if (!card || getEventStatus(card) === 'finished') return;
      card.classList.add('is-flipped');
    });
  });

  document.querySelectorAll('[data-flip-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.event-card');
      if (card) card.classList.remove('is-flipped');
    });
  });
}

function initEventSearch() {
  const input = document.querySelector('[data-events-search]');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.event-card').forEach(card => {
      const title = (card.dataset.eventTitle || '').toLowerCase();
      const desc = (card.querySelector('.event-card-desc')?.textContent || '').toLowerCase();
      const match = !q || title.includes(q) || desc.includes(q);
      card.classList.toggle('is-hidden-search', !match);
    });
  });
}

function initRSVP() {
  const overlay = document.querySelector('[data-rsvp-overlay]');
  const nameInput = document.querySelector('[data-rsvp-name]');
  const phoneInput = document.querySelector('[data-rsvp-phone]');
  const submitBtn = document.querySelector('[data-rsvp-submit]');
  const formEl = document.querySelector('[data-rsvp-form]');
  const successEl = document.querySelector('[data-rsvp-success]');
  const errorEl = document.querySelector('[data-rsvp-error]');
  let currentEventId = null;
  let currentEventTitle = '';

  function resetForm() {
    nameInput.value = '';
    phoneInput.value = '';
    formEl.style.display = '';
    successEl.classList.remove('is-showing');
    errorEl.classList.remove('is-showing');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Attendance';
  }

  document.querySelectorAll('[data-flip-rsvp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.event-card');
      if (!card || getEventStatus(card) === 'finished') return;
      if (!requireAuth()) return;
      currentEventId = card.dataset.eventId;
      currentEventTitle = card.dataset.eventTitle;
      resetForm();
      overlay.classList.add('is-open');
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('is-open');
    }
  });

  submitBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
      errorEl.textContent = 'Please enter both your name and phone number.';
      errorEl.classList.add('is-showing');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    errorEl.classList.remove('is-showing');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: currentEventId, event_title: currentEventTitle, name, phone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      formEl.style.display = 'none';
      successEl.classList.add('is-showing');

      const btn = document.querySelector(`[data-event-id="${currentEventId}"] [data-flip-rsvp]`);
      if (btn) {
        btn.textContent = '✓ Attending';
        btn.classList.add('is-confirmed');
      }

      setTimeout(() => {
        overlay.classList.remove('is-open');
      }, 2000);
    } catch (err) {
      errorEl.textContent = err.message || 'Something went wrong. Please try again.';
      errorEl.classList.add('is-showing');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Attendance';
    }
  });
}

async function init() {
  const { lenis } = initLenis();

  initInertia();
  eventsData = await loadList('events', EVENT_DEFAULTS);
  renderEvents();
  initNavbar();
  await initLoader();

  setTimeout(() => {
    document.documentElement.classList.add('fonts-loaded');
  }, 100);

  initEventFilter();
  initEventSearch();
  initCardFlips();
  initRSVP();
  initCalendarButtons();
  initSectionHeaders();

  ScrollTrigger.refresh();
  lenis.emit('scroll');
}

document.addEventListener('DOMContentLoaded', init);
