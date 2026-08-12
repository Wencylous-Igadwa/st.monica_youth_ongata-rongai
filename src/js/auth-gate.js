import { gsap } from './gsap.js';

export function requireAuth() {
  if (localStorage.getItem('auth_user')) return true;
  showAuthGate();
  return false;
}

function showAuthGate() {
  if (document.querySelector('.auth-gate-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'auth-gate-overlay';
  overlay.innerHTML = `
    <div class="auth-gate-card">
      <div class="auth-gate-particles">
        <span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <button class="auth-gate-close" aria-label="Close">&times;</button>
      <div class="auth-gate-icon">
        <svg viewBox="0 0 60 60" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="24" y="4" width="12" height="52" rx="3" fill="currentColor" opacity="0.9"/>
          <rect x="8" y="18" width="44" height="12" rx="3" fill="currentColor" opacity="0.9"/>
        </svg>
      </div>
      <h3 class="auth-gate-title">Unlock This Experience</h3>
      <p class="auth-gate-text">Sign in to your account or create a new one to access this feature and be part of our community.</p>
      <div class="auth-gate-actions">
        <a href="/login" class="auth-gate-btn auth-gate-btn-primary">
          <span>Sign In</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
        <a href="/register" class="auth-gate-btn auth-gate-btn-secondary">Create Account</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const card = overlay.querySelector('.auth-gate-card');

  gsap.set(overlay, { opacity: 0 });
  gsap.set(card, { scale: 0.8, y: 40, rotateX: 10 });

  gsap.to(overlay, { opacity: 1, duration: 0.35, ease: 'power2.out' });
  gsap.to(card, {
    scale: 1, y: 0, rotateX: 0,
    duration: 0.6, ease: 'back.out(1.4)', delay: 0.1,
  });

  const particles = overlay.querySelectorAll('.auth-gate-particles span');
  particles.forEach((p, i) => {
    gsap.set(p, {
      x: gsap.utils.random(-120, 120),
      y: gsap.utils.random(-120, 120),
      scale: gsap.utils.random(0.4, 1),
      opacity: gsap.utils.random(0.15, 0.5),
    });
    gsap.to(p, {
      x: `+=${gsap.utils.random(-40, 40)}`,
      y: `+=${gsap.utils.random(-40, 40)}`,
      opacity: gsap.utils.random(0.1, 0.4),
      duration: gsap.utils.random(3, 6),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.2,
    });
  });

  function close() {
    gsap.to(card, { scale: 0.85, y: -20, opacity: 0, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlay, {
      opacity: 0, duration: 0.3, delay: 0.05,
      onComplete: () => {
        particles.forEach(p => gsap.killTweensOf(p));
        overlay.remove();
      },
    });
  }

  overlay.querySelector('.auth-gate-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
