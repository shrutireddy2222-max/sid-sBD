document.addEventListener('DOMContentLoaded', () => {
  const config = window.BIRTHDAY_CONFIG || {};

  const nameFields = document.querySelectorAll('[data-birthday-name]');
  nameFields.forEach((field) => {
    field.textContent = config.name || '[HIS NAME]';
  });

  const greetingFields = document.querySelectorAll('[data-birthday-greeting]');
  greetingFields.forEach((field) => {
    field.textContent = config.birthdayGreeting || 'Happy Birthday';
  });

  const friendshipDateEls = document.querySelectorAll('[data-friendship-date]');
  friendshipDateEls.forEach((field) => {
    field.textContent = config.friendshipStartDate || '[YYYY-MM-DD]';
  });

  const finalMessageEls = document.querySelectorAll('[data-final-message]');
  finalMessageEls.forEach((field) => {
    field.textContent = config.finalMessage || 'Different levels of chaos, one permanent friendship.';
  });

  const birthdayIntro = document.querySelector('[data-intro-line]');
  if (birthdayIntro) {
    birthdayIntro.textContent = config.introLine || 'ACCESS GRANTED: TODAY IS YOUR DAY.';
  }

  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    const state = localStorage.getItem('birthdaySoundEnabled');
    const enabled = state === null ? true : state === 'true';
    soundToggle.setAttribute('aria-pressed', String(enabled));
    soundToggle.textContent = enabled ? '🔊 Sound On' : '🔇 Sound Off';
    soundToggle.addEventListener('click', () => {
      const next = soundToggle.getAttribute('aria-pressed') !== 'true';
      soundToggle.setAttribute('aria-pressed', String(next));
      soundToggle.textContent = next ? '🔊 Sound On' : '🔇 Sound Off';
      localStorage.setItem('birthdaySoundEnabled', String(next));
    });
  }

  initStars();
  initNavigation();
  initTypedIntro();
});

function initNavigation() {
  const pageMap = {
    '/index.html': 'index',
    '/surprise.html': 'surprise',
    '/talents.html': 'talents',
    '/roast.html': 'roast',
    '/games.html': 'games',
    '/final.html': 'final',
    '/vault.html': 'vault'
  };

  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link');
  links.forEach((link) => {
    const pageName = link.dataset.page;
    const matches = pageName === path || (pageName === 'index' && path === '');
    link.classList.toggle('active', matches);
  });

  const page = Object.keys(pageMap).find((key) => path.endsWith(key));
  if (page) {
    const pageName = pageMap[page];
    const items = document.querySelectorAll('[data-page-link]');
    items.forEach((item) => {
      if (item.dataset.pageLink === pageName) {
        item.classList.add('active');
      }
    });
  }
}

function initStars() {
  const starContainer = document.querySelector('.stars');
  if (!starContainer) return;

  const starCount = window.innerWidth < 768 ? 35 : 65;
  starContainer.innerHTML = '';

  for (let i = 0; i < starCount; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
    star.style.animationDuration = `${(Math.random() * 6 + 6).toFixed(2)}s`;
    starContainer.appendChild(star);
  }
}

function initTypedIntro() {
  const terminalLines = document.querySelectorAll('[data-type-line]');
  terminalLines.forEach((node, index) => {
    if (!node) return;
    const text = node.textContent.trim();
    node.textContent = '';
    node.dataset.original = text;
    setTimeout(() => {
      typeText(node, text, index * 250);
    }, 150 * (index + 1));
  });
}

function typeText(node, text, delay) {
  let counter = 0;
  setTimeout(() => {
    const interval = setInterval(() => {
      const nextText = text.slice(0, counter + 1);
      node.textContent = nextText;
      counter += 1;
      if (counter >= text.length) {
        clearInterval(interval);
      }
    }, 28);
  }, delay);
}

window.birthdayAudio = {
  enabled() {
    const value = localStorage.getItem('birthdaySoundEnabled');
    if (value === null) return true;
    return value === 'true';
  },
  play(type = 'click') {
    try {
      if (!window.birthdayAudio.enabled()) return;

      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      oscillator.type = type === 'celebration' ? 'triangle' : 'sine';
      oscillator.frequency.value = type === 'celebration' ? 660 : 440;
      gain.gain.value = 0.02;

      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (error) {
      // Ignore sound-device issues so the page remains fully functional even when audio is unavailable.
    }
  }
};
