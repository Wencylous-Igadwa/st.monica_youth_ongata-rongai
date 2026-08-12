const API_BASE = window.location.port === '3000' ? 'http://localhost:3001' : '';

document.documentElement.classList.add('is-ready', 'fonts-loaded');

const form = document.getElementById('verifyForm');
const emailInput = document.getElementById('verifyEmail');
const codeInput = document.getElementById('verifyCode');
const msgEl = document.getElementById('verifyMsg');
const btn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');

function showMessage(el, msg, type) {
  el.textContent = msg;
  el.className = 'verify-msg is-showing is-' + type;
}

function setLoading(el, loading) {
  if (loading) {
    el.classList.add('is-loading');
    el.disabled = true;
  } else {
    el.classList.remove('is-loading');
    el.disabled = false;
  }
}

function setResendDisabled(disabled, secondsLeft) {
  resendBtn.disabled = disabled;
  if (disabled) {
    resendBtn.textContent = `Resend code (${secondsLeft}s)`;
  } else {
    resendBtn.textContent = 'Resend code';
  }
}

function startResendCountdown() {
  let seconds = 30;
  setResendDisabled(true, seconds);
  const timer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(timer);
      setResendDisabled(false);
    } else {
      setResendDisabled(true, seconds);
    }
  }, 1000);
}

function prefillEmail() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  if (email && emailInput) emailInput.value = email;
}

async function submitVerify(e) {
  e.preventDefault();
  showMessage(msgEl, '', '');
  const email = emailInput.value.trim();
  const code = codeInput.value.trim();

  if (!email) {
    showMessage(msgEl, 'Please enter your email address.', 'error');
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    showMessage(msgEl, 'Please enter the 6-digit code from your email.', 'error');
    return;
  }

  setLoading(btn, true);
  try {
    const res = await fetch(`${API_BASE}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(msgEl, data.error || 'Verification failed. Please try again.', 'error');
      setLoading(btn, false);
      return;
    }

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    showMessage(msgEl, 'Account verified! Redirecting you to your profile...', 'success');
    setTimeout(() => {
      window.location.href = '/profile';
    }, 800);
  } catch (err) {
    showMessage(msgEl, 'Network error. Please check your connection.', 'error');
    setLoading(btn, false);
  }
}

async function resendCode() {
  showMessage(msgEl, '', '');
  const email = emailInput.value.trim();
  if (!email) {
    showMessage(msgEl, 'Enter your email address first.', 'error');
    return;
  }
  setLoading(resendBtn, true);
  try {
    const res = await fetch(`${API_BASE}/api/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage(msgEl, data.error || 'Could not resend the code.', 'error');
      setLoading(resendBtn, false);
      return;
    }
    showMessage(msgEl, 'A new code has been sent to your email.', 'success');
    setLoading(resendBtn, false);
    startResendCountdown();
  } catch (err) {
    showMessage(msgEl, 'Network error. Please check your connection.', 'error');
    setLoading(resendBtn, false);
  }
}

prefillEmail();
form.addEventListener('submit', submitVerify);
resendBtn.addEventListener('click', resendCode);
