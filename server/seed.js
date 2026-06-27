import 'dotenv/config';
import { initDb } from './db.js';
import db from './db.js';

const events = [
  { id: 'e1', title: 'Youth Night Worship', date: '2025-06-15', time: '6:00 PM', location: 'Parish Hall', status: 'upcoming', duration: 2, description: 'Evening of worship and fellowship for all youth.', image: '/images/koh-01.jpeg' },
  { id: 'e2', title: 'Sunday Youth Mass', date: '2025-06-22', time: '10:00 AM', location: 'Main Church', status: 'upcoming', duration: 1.5, description: 'Weekly youth mass celebration.', image: '/images/st-monica-1.jpeg' },
  { id: 'e3', title: 'Summer Retreat', date: '2025-07-05', time: '8:00 AM', location: 'Faith Camp', status: 'upcoming', duration: 48, description: 'Annual youth retreat with activities and talks.', image: '/images/koh-02.jpeg' },
  { id: 'e4', title: 'Service Project Day', date: '2025-07-12', time: '4:00 PM', location: 'Community Center', status: 'upcoming', duration: 3, description: 'Giving back to the community through service.', image: '/images/index.jpeg' },
  { id: 'e5', title: 'Bible Study: Gospels', date: '2025-07-19', time: '7:00 PM', location: 'Youth Room', status: 'upcoming', duration: 2, description: 'Deep dive into the Gospel of Mark.', image: '/images/mary_jesus_01.jpeg' },
];

const gallery = [
  { id: 'g1', title: 'Youth Night Worship', meta: 'Jun 15 · 6:00 PM', images: JSON.stringify(['/images/koh-01.jpeg', '/images/koh-02.jpeg', '/images/koh-v-2.jpeg', '/images/st-monica-1.jpeg', '/images/mary_jesus_01.jpeg', '/images/index.jpeg']) },
  { id: 'g2', title: 'Sunday Youth Mass', meta: 'Jun 22 · 10:00 AM', images: JSON.stringify(['/images/st-monica-1.jpeg']) },
  { id: 'g3', title: 'Summer Retreat 2025', meta: 'Jul 5 · 8:00 AM', images: JSON.stringify(['/images/koh-02.jpeg', '/images/index.jpeg']) },
  { id: 'g4', title: 'Service Project Day', meta: 'Jul 12 · 4:00 PM', images: JSON.stringify(['/images/index.jpeg', '/images/koh-01.jpeg']) },
  { id: 'g5', title: 'Bible Study: Gospels', meta: 'Jul 19 · 7:00 PM', images: JSON.stringify(['/images/mary_jesus_01.jpeg']) },
];

const spotlight = [
  { id: '1', type: 'sports-mvp', event: 'Youth Football Tournament', date: 'Mar 15, 2025', image: '/images/koh-01.jpeg', title: 'Michael Omondi', subtitle: '3 goals in the championship final' },
  { id: '2', type: 'sports-mvp', event: 'Basketball Marathon', date: 'Apr 2, 2025', image: '/images/koh-02.jpeg', title: 'David Mwangi', subtitle: 'Game-winning assist record' },
  { id: '3', type: 'sports-mvp', event: 'Inter-Parish Athletics', date: 'May 10, 2025', image: '/images/index.jpeg', title: 'Sarah Akinyi', subtitle: 'Gold in 100m & 200m sprint' },
  { id: '4', type: 'funniest-pic', event: 'Youth Night Worship', date: 'Jun 15, 2025', image: '/images/koh-01.jpeg', title: 'The Dancing Duo', subtitle: 'Best moves of the night' },
  { id: '5', type: 'funniest-pic', event: 'Summer Retreat', date: 'Jul 5, 2025', image: '/images/koh-02.jpeg', title: 'Falling Chair Prank', subtitle: 'Perfectly timed capture' },
  { id: '6', type: 'funniest-pic', event: 'Service Project Day', date: 'Jul 12, 2025', image: '/images/index.jpeg', title: 'Muddy but Happy', subtitle: 'After the community clean-up' },
  { id: '7', type: 'best-picture', event: 'Sunday Youth Mass', date: 'Jun 22, 2025', image: '/images/st-monica-1.jpeg', title: 'Sunset Prayer', subtitle: 'Golden hour at the parish' },
  { id: '8', type: 'best-picture', event: 'Bible Study: Gospels', date: 'Jul 19, 2025', image: '/images/mary_jesus_01.jpeg', title: 'Candlelight Reflection', subtitle: 'Quiet moment of devotion' },
  { id: '9', type: 'best-picture', event: 'Youth Football Tournament', date: 'Mar 15, 2025', image: '/images/koh-01.jpeg', title: 'Team Huddle', subtitle: 'Unity before the match' },
  { id: '10', type: 'best-moment', event: 'Summer Retreat', date: 'Jul 5, 2025', image: '/images/koh-02.jpeg', title: 'Campfire Fellowship', subtitle: 'Sharing stories under the stars' },
  { id: '11', type: 'best-moment', event: 'Youth Night Worship', date: 'Jun 15, 2025', image: '/images/koh-01.jpeg', title: 'First-time Testimony', subtitle: 'A brave heart sharing faith' },
  { id: '12', type: 'best-moment', event: 'Service Project Day', date: 'Jul 12, 2025', image: '/images/st-monica-1.jpeg', title: 'Elderly Home Visit', subtitle: 'Bringing joy to the community' },
  { id: '13', type: 'best-dressed', event: 'Youth Night Worship', date: 'Jun 15, 2025', image: '/images/index.jpeg', title: 'Esther Nyambura', subtitle: 'Elegant in traditional attire' },
  { id: '14', type: 'best-dressed', event: 'Sunday Youth Mass', date: 'Jun 22, 2025', image: '/images/st-monica-1.jpeg', title: 'Peter Kimani', subtitle: 'Sharp in African linen' },
  { id: '15', type: 'best-dressed', event: 'Inter-Parish Athletics', date: 'May 10, 2025', image: '/images/koh-02.jpeg', title: 'Grace Akinyi', subtitle: 'Sporty-chic team captain' },
  { id: '16', type: 'most-active', event: 'Service Project Day', date: 'Jul 12, 2025', image: '/images/koh-01.jpeg', title: 'Peter Kimani', subtitle: '10+ hours volunteer service' },
  { id: '17', type: 'most-active', event: 'Youth Night Worship', date: 'Jun 15, 2025', image: '/images/koh-02.jpeg', title: 'Mary Wanjiku', subtitle: 'Attended all events this month' },
  { id: '18', type: 'most-active', event: 'Bible Study: Gospels', date: 'Jul 19, 2025', image: '/images/index.jpeg', title: 'Kevin Omondi', subtitle: 'Led worship team every session' },
];

const sports = [
  { id: 's1', sport: 'football', competition: 'Deanery League', date: '2025-03-15', team1: 'St. Monica', team2: "St. Joseph's", score1: 3, score2: 1, notes: "Luke 23', David 57', Joseph 81' (pen)" },
  { id: 's2', sport: 'football', competition: 'Parish Cup', date: '2025-02-22', team1: 'St. Monica', team2: 'Holy Family', score1: 2, score2: 0, notes: "Peter 12', Andrew 64'" },
  { id: 's3', sport: 'football', competition: 'Deanery League', date: '2025-02-08', team1: 'Christ the King', team2: 'St. Monica', score1: 1, score2: 1, notes: "James 73'" },
  { id: 's4', sport: 'football', competition: 'Deanery League', date: '2025-01-25', team1: 'St. Monica', team2: 'Our Lady Queen', score1: 4, score2: 2, notes: "Samuel 8', Joseph 34', Luke 52' (pen), Thomas 67' missed" },
  { id: 's5', sport: 'football', competition: 'Parish Cup', date: '2025-01-11', team1: "St. Peter's", team2: 'St. Monica', score1: 2, score2: 1, notes: "Mark 43', Andrew 89' (pen)" },
  { id: 's6', sport: 'football', competition: 'Friendly', date: '2024-12-14', team1: 'St. Monica', team2: 'All Saints Youth', score1: 5, score2: 0, notes: "Joseph 14', Samuel 28', David 56', Peter 71', Luke 88' (pen)" },
];

async function seed() {
  await initDb();

  const sections = ['events', 'gallery', 'spotlight', 'sports'];
  const counts = await Promise.all(sections.map(t => db.get(`SELECT COUNT(*) as c FROM ${t}`)));
  const empty = counts.every(r => r.c === 0);
  if (!empty) {
    console.log('Database already has data, skipping seed.');
    process.exit(0);
  }

  for (const e of events) {
    await db.run(`INSERT INTO events (id, title, date, time, location, status, duration, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.id, e.title, e.date, e.time, e.location, e.status, e.duration, e.description, e.image]);
  }
  for (const g of gallery) {
    await db.run(`INSERT INTO gallery (id, title, meta, images) VALUES (?, ?, ?, ?)`,
      [g.id, g.title, g.meta, g.images]);
  }
  for (const s of spotlight) {
    await db.run(`INSERT INTO spotlight (id, type, event, date, title, subtitle, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.type, s.event, s.date, s.title, s.subtitle, s.image]);
  }
  for (const s of sports) {
    await db.run(`INSERT INTO sports (id, sport, competition, date, team1, team2, score1, score2, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.sport, s.competition, s.date, s.team1, s.team2, s.score1, s.score2, s.notes]);
  }

  console.log('Database seeded successfully with default data.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
