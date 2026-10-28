document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = event.currentTarget;
      const href = target.getAttribute('href');
      if (!href) return;
      if (window.birthdayAudio) {
        window.birthdayAudio.play('click');
      }
      const stored = localStorage.getItem('lastVisitedPage');
      if (stored) {
        localStorage.setItem('lastVisitedPage', href);
      } else {
        localStorage.setItem('lastVisitedPage', href);
      }
    });
  });

  const backLinks = document.querySelectorAll('[data-back-href]');
  backLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.birthdayAudio) {
        window.birthdayAudio.play('click');
      }
    });
  });
});
