document.addEventListener('DOMContentLoaded', () => {
  const config = window.BIRTHDAY_CONFIG || {};
  const revealText = document.getElementById('surpriseText');
  const confettiContainer = document.getElementById('confettiContainer');
  const emotionButton = document.getElementById('emotionButton');
  const moreButton = document.getElementById('moreButton');

  if (revealText) {
    revealText.textContent = `${config.birthdayGreeting || 'Happy Birthday'} ${config.name || '[HIS NAME]'}`;
  }

  if (confettiContainer) {
    createConfetti(confettiContainer, 80);
  }

  if (emotionButton) {
    emotionButton.addEventListener('click', () => {
      window.birthdayAudio.play('celebration');
      const message = [
        'You are deeply loved, slightly overestimated, and absolutely iconic.',
        'Okay, technically you are the main character of this chaos.',
        'We are all just here for the boyfriend energy disguised as best-friend energy.',
        'No one can say this friendship is boring. It is a full-time event.'
      ];
      const note = document.getElementById('funnyResponse');
      if (note) {
        note.textContent = message[Math.floor(Math.random() * message.length)];
      }
    });
  }

  if (moreButton) {
    moreButton.addEventListener('click', () => {
      window.location.href = 'talents.html';
    });
  }
});

function createConfetti(container, amount) {
  if (!container) return;

  const colors = ['#f9d76e', '#58c7ff', '#b38cff', '#ff7ecb', '#6cf2b3'];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${(Math.random() * 0.2).toFixed(2)}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.setProperty('--x', `${(Math.random() * 120 - 60).toFixed(2)}px`);
    piece.style.setProperty('--y', `${(Math.random() * 250 + 80).toFixed(2)}px`);
    container.appendChild(piece);
  }
}
