import { gsap } from './gsap.js';
import { initLoader } from './loader.js';

const API_BASE = window.location.port === '3000' ? 'http://localhost:3001' : '';

function showError(el, msg, type) {
  el.textContent = msg;
  el.classList.remove('is-error', 'is-success');
  el.classList.add('is-showing');
  if (type) el.classList.add('is-' + type);
  gsap.fromTo(el, { opacity: 0, y: -5 }, { opacity: 1, y: 0, duration: 0.3 });
}

function hideError(el) {
  el.classList.remove('is-showing');
}

function setLoading(btn, loading) {
  if (loading) {
    btn.classList.add('is-loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('is-loading');
    btn.disabled = false;
  }
}

function setupPasswordToggles() {
  document.querySelectorAll('[data-toggle-pw]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePw);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  });
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function initYeti(container, emailId, passwordId) {
  if (!container) return;
  const email = document.getElementById(emailId);
  const password = document.getElementById(passwordId);
  if (!email || !password) return;

  const eyeL = container.querySelector('.eyeL');
  const eyeR = container.querySelector('.eyeR');
  const nose = container.querySelector('.nose');
  const mouth = container.querySelector('.mouth');
  const chin = container.querySelector('.chin');
  const face = container.querySelector('.face');
  const eyebrow = container.querySelector('.eyebrow');
  const outerEarL = container.querySelector('.earL .outerEar');
  const outerEarR = container.querySelector('.earR .outerEar');
  const earHairL = container.querySelector('.earL .earHair');
  const earHairR = container.querySelector('.earR .earHair');
  const hair = container.querySelector('.hair');
  const armL = container.querySelector('.armL');
  const armR = container.querySelector('.armR');
  const twoFingers = container.querySelector('.twoFingers');

  let activeElement = null, eyeScale = 1, eyesCovered = false, blinking = null;
  let screenCenter, emailCoords, emailScrollMax;
  let eyeLCoords, eyeRCoords, noseCoords, mouthCoords;
  let eyeLAngle, eyeRAngle, noseAngle, mouthAngle;
  const chinMin = 0.5;

  function getPosition(el) {
    let xPos = 0, yPos = 0;
    while (el) {
      if (el.tagName === 'BODY') {
        xPos += (el.offsetLeft - (el.scrollLeft || document.documentElement.scrollLeft) + el.clientLeft);
        yPos += (el.offsetTop - (el.scrollTop || document.documentElement.scrollTop) + el.clientTop);
      } else {
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }
      el = el.offsetParent;
    }
    return { x: xPos, y: yPos };
  }

  function getAngle(x1, y1, x2, y2) { return Math.atan2(y1 - y2, x1 - x2); }
  function getRandomInt(max) { return Math.floor(Math.random() * Math.floor(max)); }

  function calculateFaceMove() {
    let carPos = email.selectionEnd;
    if (carPos == null || carPos === 0) carPos = email.value.length;
    const div = document.createElement('div');
    const span = document.createElement('span');
    const copyStyle = getComputedStyle(email);
    [].forEach.call(copyStyle, function(p) { div.style[p] = copyStyle[p]; });
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    div.textContent = email.value.substr(0, carPos);
    span.textContent = email.value.substr(carPos) || '.';
    div.appendChild(span);

    let dFromC;
    if (email.scrollWidth <= emailScrollMax) {
      const c = getPosition(span);
      dFromC = screenCenter - (c.x + emailCoords.x);
      eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + c.x, emailCoords.y + 25);
      eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + c.x, emailCoords.y + 25);
      noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + c.x, emailCoords.y + 25);
      mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + c.x, emailCoords.y + 25);
    } else {
      eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
      eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
      noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
      mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
    }

    const eLX = Math.cos(eyeLAngle) * 20 * sc, eLY = Math.sin(eyeLAngle) * 10 * sc;
    const eRX = Math.cos(eyeRAngle) * 20 * sc, eRY = Math.sin(eyeRAngle) * 10 * sc;
    const nX = Math.cos(noseAngle) * 23 * sc, nY = Math.sin(noseAngle) * 10 * sc;
    const mX = Math.cos(mouthAngle) * 23 * sc, mY = Math.sin(mouthAngle) * 10 * sc;
    const mR = Math.cos(mouthAngle) * 6 * sc;
    const cX = mX * 0.8, cY = mY * 0.5;
    let cS = 1 - ((dFromC * 0.15) / 100);
    if (cS > 1) { cS = 1 - (cS - 1); if (cS < chinMin) cS = chinMin; }
    const fX = mX * 0.3, fY = mY * 0.4;
    const fSkew = Math.cos(mouthAngle) * 5;
    const eSkew = Math.cos(mouthAngle) * 25;
    const oeX = Math.cos(mouthAngle) * 4 * sc, oeY = Math.cos(mouthAngle) * 5 * sc;
    const hX = Math.cos(mouthAngle) * 6 * sc;

    gsap.to(eyeL, 1, { x: -eLX, y: -eLY, ease: 'expo.out' });
    gsap.to(eyeR, 1, { x: -eRX, y: -eRY, ease: 'expo.out' });
    gsap.to(nose, 1, { x: -nX, y: -nY, rotation: mR, transformOrigin: 'center center', ease: 'expo.out' });
    gsap.to(mouth, 1, { x: -mX, y: -mY, rotation: mR, transformOrigin: 'center center', ease: 'expo.out' });
    gsap.to(chin, 1, { x: -cX, y: -cY, scaleY: cS, ease: 'expo.out' });
    gsap.to(face, 1, { x: -fX, y: -fY, skewX: -fSkew, transformOrigin: 'center top', ease: 'expo.out' });
    gsap.to(eyebrow, 1, { x: -fX, y: -fY, skewX: -eSkew, transformOrigin: 'center top', ease: 'expo.out' });
    gsap.to(outerEarL, 1, { x: oeX, y: -oeY, ease: 'expo.out' });
    gsap.to(outerEarR, 1, { x: oeX, y: oeY, ease: 'expo.out' });
    gsap.to(earHairL, 1, { x: -oeX, y: -oeY, ease: 'expo.out' });
    gsap.to(earHairR, 1, { x: -oeX, y: oeY, ease: 'expo.out' });
    gsap.to(hair, 1, { x: hX, scaleY: 1.2, transformOrigin: 'center bottom', ease: 'expo.out' });

    document.body.removeChild(div);
  }

  function onEmailInput() {
    calculateFaceMove();
    const v = email.value;
    if (v.length > 0) {
      const s = v.includes('@') ? 0.65 : 0.85;
      gsap.to([eyeL, eyeR], 1, { scaleX: s, scaleY: s, ease: 'expo.out', transformOrigin: 'center center' });
      eyeScale = s;
    } else {
      gsap.to([eyeL, eyeR], 1, { scaleX: 1, scaleY: 1, ease: 'expo.out' });
      eyeScale = 1;
    }
  }

  function onEmailFocus() { activeElement = 'email'; emailScrollMax = email.scrollWidth; onEmailInput(); }
  function onEmailBlur() {
    activeElement = null;
    setTimeout(function() { if (activeElement !== 'email') resetFace(); }, 100);
  }
  function onPasswordFocus() { activeElement = 'password'; if (!eyesCovered) coverEyes(); }
  function onPasswordBlur() {
    activeElement = null;
    setTimeout(function() { if (activeElement !== 'toggle' && activeElement !== 'password') uncoverEyes(); }, 100);
  }
  function onToggleFocus() { activeElement = 'toggle'; if (!eyesCovered) coverEyes(); }
  function onToggleBlur() {
    activeElement = null;
    setTimeout(function() { if (activeElement !== 'password' && activeElement !== 'toggle') uncoverEyes(); }, 100);
  }

  function coverEyes() {
    gsap.killTweensOf([armL, armR]);
    gsap.set([armL, armR], { visibility: 'visible' });
    gsap.to(armL, 0.45, { x: -93 * sc, y: 10 * sc, rotation: 0, ease: 'quad.out' });
    gsap.to(armR, 0.45, { x: -93 * sc, y: 10 * sc, rotation: 0, ease: 'quad.out', delay: 0.1 });
    eyesCovered = true;
  }

  function uncoverEyes() {
    gsap.killTweensOf([armL, armR]);
    gsap.to(armL, 1.35, { y: 220 * sc, ease: 'quad.out' });
    gsap.to(armL, 1.35, { rotation: 105, ease: 'quad.out', delay: 0.1 });
    gsap.to(armR, 1.35, { y: 220 * sc, ease: 'quad.out' });
    gsap.to(armR, 1.35, {
      rotation: -105, ease: 'quad.out', delay: 0.1, onComplete() {
        gsap.set([armL, armR], { visibility: 'hidden' });
      }
    });
    eyesCovered = false;
  }

  function resetFace() {
    gsap.to([eyeL, eyeR], 1, { x: 0, y: 0, ease: 'expo.out' });
    gsap.to(nose, 1, { x: 0, y: 0, scaleX: 1, scaleY: 1, ease: 'expo.out' });
    gsap.to(mouth, 1, { x: 0, y: 0, rotation: 0, ease: 'expo.out' });
    gsap.to(chin, 1, { x: 0, y: 0, scaleY: 1, ease: 'expo.out' });
    gsap.to([face, eyebrow], 1, { x: 0, y: 0, skewX: 0, ease: 'expo.out' });
    gsap.to([outerEarL, outerEarR, earHairL, earHairR, hair], 1, { x: 0, y: 0, scaleY: 1, ease: 'expo.out' });
  }

  function startBlinking(delay) {
    delay = delay ? getRandomInt(delay) : 1;
    blinking = gsap.to([eyeL, eyeR], 0.1, {
      delay, scaleY: 0, yoyo: true, repeat: 1,
      transformOrigin: 'center center',
      onComplete() { startBlinking(12); }
    });
  }

  function spreadFingers() {
    gsap.to(twoFingers, 0.35, { transformOrigin: 'bottom left', rotation: 30, x: -9 * sc, y: -2 * sc, ease: 'power2.inOut' });
  }

  function closeFingers() {
    gsap.to(twoFingers, 0.35, { transformOrigin: 'bottom left', rotation: 0, x: 0, y: 0, ease: 'power2.inOut' });
  }

  const svgCoords = getPosition(container);
  emailCoords = getPosition(email);
  screenCenter = svgCoords.x + (container.offsetWidth / 2);
  const sc = container.offsetWidth / 200;
  eyeLCoords = { x: svgCoords.x + 84 * sc, y: svgCoords.y + 76 * sc };
  eyeRCoords = { x: svgCoords.x + 113 * sc, y: svgCoords.y + 76 * sc };
  noseCoords = { x: svgCoords.x + 97 * sc, y: svgCoords.y + 81 * sc };
  mouthCoords = { x: svgCoords.x + 100 * sc, y: svgCoords.y + 100 * sc };

  email.addEventListener('focus', onEmailFocus);
  email.addEventListener('blur', onEmailBlur);
  email.addEventListener('input', onEmailInput);
  password.addEventListener('focus', onPasswordFocus);
  password.addEventListener('blur', onPasswordBlur);

  const cardFace = container.closest('.doodle-card-front, .doodle-card-back');
  if (cardFace) {
    const toggleBtn = cardFace.querySelector('.doodle-pw-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('focus', onToggleFocus);
      toggleBtn.addEventListener('blur', onToggleBlur);
      toggleBtn.addEventListener('click', function() {
        setTimeout(function() { password.type === 'text' ? spreadFingers() : closeFingers(); }, 50);
      });
    }
  }

  gsap.set(armL, { x: -93 * sc, y: 220 * sc, rotation: 105, transformOrigin: 'top left' });
  gsap.set(armR, { x: -93 * sc, y: 220 * sc, rotation: -105, transformOrigin: 'top right' });
  gsap.set(mouth, { transformOrigin: 'center center' });
  startBlinking(5);
  emailScrollMax = email.scrollWidth;

  if (isMobileDevice()) { password.type = 'text'; spreadFingers(); }
}

function setupDoodleToggle() {
  const checkbox = document.getElementById('doodle-flip');
  if (!checkbox) return;

  const path = window.location.pathname;
  checkbox.checked = path === '/register';
}

function initRegisterPage() {
  const form = document.getElementById('registerForm');
  const errorEl = document.getElementById('registerError');
  const btn = document.getElementById('registerBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorEl);

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirm = form.confirm.value;

    if (!name || !email || !password || !confirm) {
      showError(errorEl, 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      showError(errorEl, 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      showError(errorEl, 'Passwords do not match.');
      return;
    }

    setLoading(btn, true);

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(errorEl, data.error || 'Registration failed. Please try again.');
        setLoading(btn, false);
        return;
      }

      if (data.requiresVerification) {
        showError(errorEl, 'A verification code has been sent to your email. Redirecting to the verification page...', 'success');
        setTimeout(() => {
          window.location.href = `/verify?email=${encodeURIComponent(data.email || form.email.value.trim())}`;
        }, 1200);
        return;
      }

      showError(errorEl, 'Thank you for registering! Your account is pending approval by our admin. You will be able to log in once it is approved.', 'success');
      form.reset();
      setLoading(btn, false);
    } catch (err) {
      showError(errorEl, 'Network error. Please check your connection.');
      setLoading(btn, false);
    }
  });
}

function initLoginPage() {
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorEl);

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showError(errorEl, 'Please enter your email and password.');
      return;
    }

    setLoading(btn, true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(errorEl, data.error || 'Invalid credentials.');
        setLoading(btn, false);
        return;
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      gsap.to('.doodle-card-scene', {
        scale: 0.95, opacity: 0, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect') || '/profile';
          window.location.href = redirect;
        }
      });
    } catch (err) {
      showError(errorEl, 'Network error. Please check your connection.');
      setLoading(btn, false);
    }
  });
}

async function init() {
  await initLoader();
  document.documentElement.classList.add('fonts-loaded');
  setupPasswordToggles();
  setupDoodleToggle();

  initRegisterPage();
  initLoginPage();

  initYeti(document.getElementById('loginYeti'), 'loginEmail', 'loginPassword');
  initYeti(document.getElementById('regYeti'), 'regEmail', 'regPassword');
}

document.addEventListener('DOMContentLoaded', init);
