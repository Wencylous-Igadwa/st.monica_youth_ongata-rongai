function toGCFormat(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}T${hh}${mm}00`;
}

export function openGoogleCalendar({ title, description, location, startDate, durationHours = 2 }) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toGCFormat(start)}/${toGCFormat(end)}`,
    details: description,
    location: location,
    trp: 'false',
    sprop: '',
  });

  window.open(`https://www.google.com/calendar/render?${params.toString()}`, '_blank', 'noopener,noreferrer');
}

function isCardFinished(card) {
  const dateStr = card.dataset.eventDate;
  if (!dateStr) return true;
  const start = new Date(dateStr).getTime();
  const durationMs = (parseFloat(card.dataset.eventDuration) || 2) * 60 * 60 * 1000;
  return Date.now() > start + durationMs;
}

export function initCalendarButtons() {
  document.querySelectorAll('.event-card-calendar').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.event-card');
      if (!card || isCardFinished(card)) return;

      const title = card.querySelector('.event-card-title')?.textContent?.trim() || 'Event';
      const desc = card.querySelector('.event-card-desc')?.textContent?.trim() || '';
      const metaSpans = card.querySelectorAll('.event-card-meta span');
      const location = metaSpans[1]?.textContent?.trim() || '';
      const dateStr = card.dataset.eventDate;

      if (!dateStr) return;

      openGoogleCalendar({
        title,
        description: `${desc}\n\nReminder: Set a notification 2 days before this event!`,
        location,
        startDate: dateStr,
        durationHours: 2,
      });
    });
  });
}
