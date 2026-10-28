document.addEventListener('DOMContentLoaded', () => {
  initGameMenu();
  initCakeCatchGame();
  initTriviaGame();
  initMemoryMatchGame();
  initReactionGame();
});

function initGameMenu() {
  const gameButtons = document.querySelectorAll('[data-game-start]');
  const panels = document.querySelectorAll('.game-panel');
  const menu = document.getElementById('arcade-menu');

  gameButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = `${button.dataset.gameStart}-game`;
      const target = document.getElementById(targetId);
      panels.forEach((panel) => panel.classList.remove('active'));
      if (menu) menu.classList.remove('active');
      if (target) target.classList.add('active');
      if (window.birthdayAudio) window.birthdayAudio.play('click');
    });
  });

  document.querySelectorAll('[data-back-to-menu]').forEach((button) => {
    button.addEventListener('click', () => {
      panels.forEach((panel) => panel.classList.remove('active'));
      if (menu) menu.classList.add('active');
      if (window.birthdayAudio) window.birthdayAudio.play('click');
    });
  });
}

function initCakeCatchGame() {
  const root = document.getElementById('cake-catch-game');
  if (!root) return;

  const field = root.querySelector('.cake-field');
  const basket = root.querySelector('.cake-basket');
  const scoreEl = root.querySelector('[data-score]');
  const timerEl = root.querySelector('[data-timer]');
  const statusEl = root.querySelector('[data-status]');
  const startBtn = root.querySelector('[data-game-action="start"]');
  const restartBtn = root.querySelector('[data-game-action="restart"]');

  let score = 0;
  let basketX = 0;
  let startTime = 0;
  let gameInterval = null;
  let spawnInterval = null;
  let isRunning = false;
  let keyLeft = false;
  let keyRight = false;
  const duration = 20;

  const updateScore = () => {
    scoreEl.textContent = String(score);
  };

  const clampBasket = () => {
    if (!field || !basket) return;
    const maxX = field.clientWidth - basket.offsetWidth;
    basketX = Math.max(0, Math.min(maxX, basketX));
    basket.style.transform = `translateX(${basketX}px)`;
  };

  const moveBasket = () => {
    const step = 18;
    if (keyLeft) basketX -= step;
    if (keyRight) basketX += step;
    clampBasket();
  };

  const spawnCake = () => {
    if (!field || !isRunning) return;

    const cake = document.createElement('div');
    cake.className = 'falling-cake';
    cake.textContent = '🎂';
    const left = Math.random() * (field.clientWidth - 34);
    cake.style.left = `${left}px`;
    field.appendChild(cake);

    let top = 0;
    const tick = () => {
      if (!isRunning) {
        cake.remove();
        return;
      }

      top += 6;
      cake.style.top = `${top}px`;
      const cakeRect = cake.getBoundingClientRect();
      const basketRect = basket.getBoundingClientRect();
      const catches =
        cakeRect.bottom >= basketRect.top &&
        cakeRect.top <= basketRect.bottom &&
        cakeRect.left >= basketRect.left &&
        cakeRect.right <= basketRect.right;

      if (catches) {
        score += 1;
        updateScore();
        if (window.birthdayAudio) window.birthdayAudio.play('celebration');
        cake.remove();
        return;
      }

      if (top > field.clientHeight - 40) {
        cake.remove();
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const endGame = () => {
    isRunning = false;
    clearInterval(spawnInterval);
    clearInterval(gameInterval);
    const result = score >= 10
      ? 'Legendary catch streak. You are basically the birthday MVP.'
      : `You scored ${score}. Not bad for a human with a cereal-box strategy.`;
    statusEl.textContent = result;
    if (window.birthdayAudio) window.birthdayAudio.play('celebration');
  };

  const updateTimer = () => {
    const remaining = Math.max(0, duration - Math.floor((Date.now() - startTime) / 1000));
    timerEl.textContent = `${remaining}s`;
    if (remaining <= 0) endGame();
  };

  const beginGame = () => {
    score = 0;
    basketX = 0;
    clampBasket();
    startTime = Date.now();
    isRunning = true;
    updateScore();
    statusEl.textContent = 'Catch the cakes before time runs out!';
    spawnInterval = setInterval(spawnCake, 700);
    gameInterval = setInterval(updateTimer, 200);
    if (window.birthdayAudio) window.birthdayAudio.play('click');
  };

  startBtn.addEventListener('click', beginGame);
  restartBtn.addEventListener('click', beginGame);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') keyLeft = true;
    if (event.key === 'ArrowRight') keyRight = true;
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') keyLeft = false;
    if (event.key === 'ArrowRight') keyRight = false;
  });

  field.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    const rect = field.getBoundingClientRect();
    const targetX = touch.clientX - rect.left - basket.offsetWidth / 2;
    basketX = Math.max(0, Math.min(field.clientWidth - basket.offsetWidth, targetX));
    clampBasket();
  }, { passive: true });

  field.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    const rect = field.getBoundingClientRect();
    const targetX = touch.clientX - rect.left - basket.offsetWidth / 2;
    basketX = Math.max(0, Math.min(field.clientWidth - basket.offsetWidth, targetX));
    clampBasket();
  }, { passive: true });

  setInterval(() => {
    if (isRunning) moveBasket();
  }, 20);

  updateScore();
  timerEl.textContent = `${duration}s`;
  clampBasket();
}

function initTriviaGame() {
  const root = document.getElementById('trivia-game');
  if (!root) return;

  const config = window.BIRTHDAY_CONFIG || {};
  const questions = Array.isArray(config.trivia) ? config.trivia : [];
  const questionCounter = root.querySelector('[data-question-counter]');
  const questionText = root.querySelector('[data-question]');
  const choicesWrap = root.querySelector('[data-choices]');
  const scoreEl = root.querySelector('[data-score]');
  const feedback = root.querySelector('[data-feedback]');
  const nextButton = root.querySelector('[data-next-question]');
  const restartButton = root.querySelector('[data-restart-trivia]');
  const resultScreen = root.querySelector('[data-result-screen]');

  let currentIndex = 0;
  let score = 0;

  const renderQuestion = () => {
    if (currentIndex >= questions.length) {
      const pct = Math.round((score / Math.max(questions.length, 1)) * 100);
      let resultText = 'You are a chaos enthusiast with excellent instincts.';
      if (pct >= 80) resultText = 'Excellent. Your best-friend logic is elite.';
      else if (pct >= 50) resultText = 'Strong work. The chaos is balanced and the vibes are good.';
      else if (pct < 40) resultText = 'A little off-track, but still a top-tier friend.';

      if (resultScreen) {
        resultScreen.classList.remove('hidden');
        resultScreen.innerHTML = `
          <h3>Trivia results</h3>
          <p>You scored ${score}/${questions.length}.</p>
          <p>${resultText}</p>
        `;
      }
      return;
    }

    const question = questions[currentIndex];
    questionCounter.textContent = `Question ${currentIndex + 1}/${questions.length}`;
    questionText.textContent = question.question;
    scoreEl.textContent = `Score: ${score}`;
    feedback.textContent = '';
    choicesWrap.innerHTML = '';

    question.options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-option';
      button.textContent = option;
      button.addEventListener('click', () => {
        const correctAnswer = option === question.answer;
        if (correctAnswer) {
          score += 1;
          scoreEl.textContent = `Score: ${score}`;
          feedback.textContent = 'Correct. Excellent instincts.';
        } else {
          feedback.textContent = `Not quite. The correct answer was: ${question.answer}`;
        }
        if (window.birthdayAudio) window.birthdayAudio.play('celebration');
        Array.from(choicesWrap.children).forEach((choice) => choice.disabled = true);
        nextButton.disabled = false;
      });
      choicesWrap.appendChild(button);
    });

    nextButton.disabled = true;
    if (resultScreen) resultScreen.classList.add('hidden');
  };

  nextButton.addEventListener('click', () => {
    currentIndex += 1;
    renderQuestion();
  });

  restartButton.addEventListener('click', () => {
    currentIndex = 0;
    score = 0;
    scoreEl.textContent = 'Score: 0';
    renderQuestion();
  });

  renderQuestion();
}

function initMemoryMatchGame() {
  const root = document.getElementById('memory-match-game');
  if (!root) return;

  const board = root.querySelector('[data-memory-board]');
  const movesEl = root.querySelector('[data-moves]');
  const timeEl = root.querySelector('[data-time]');
  const statusEl = root.querySelector('[data-matches-status]');
  const restartBtn = root.querySelector('[data-restart-memory]');
  const successEl = root.querySelector('[data-match-success]');

  const symbols = ['🎂', '🎉', '🎁', '🕺', '🔥', '⭐'];
  const deck = [...symbols, ...symbols];
  let openedCards = [];
  let moves = 0;
  let matchedPairs = 0;
  let timer = 0;
  let timerId = null;

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const startTimer = () => {
    clearInterval(timerId);
    timer = 0;
    timeEl.textContent = `Time: ${timer}s`;
    timerId = setInterval(() => {
      timer += 1;
      timeEl.textContent = `Time: ${timer}s`;
    }, 1000);
  };

  const resetBoard = () => {
    board.innerHTML = '';
    openedCards = [];
    moves = 0;
    matchedPairs = 0;
    movesEl.textContent = 'Moves: 0';
    statusEl.textContent = 'Find all the pairs.';
    successEl.classList.add('hidden');
    shuffle(deck).forEach((emoji) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory-card-tile';
      card.dataset.value = emoji;
      card.textContent = '❔';
      card.addEventListener('click', () => handleCardClick(card));
      board.appendChild(card);
    });
    startTimer();
  };

  const handleCardClick = (card) => {
    if (card.disabled || openedCards.includes(card)) return;

    card.textContent = card.dataset.value;
    card.classList.add('revealed');
    openedCards.push(card);

    if (openedCards.length === 2) {
      moves += 1;
      movesEl.textContent = `Moves: ${moves}`;
      const [first, second] = openedCards;

      if (first.dataset.value === second.dataset.value) {
        matchedPairs += 1;
        statusEl.textContent = 'Nice match!';
        first.disabled = true;
        second.disabled = true;
        openedCards = [];

        if (matchedPairs === symbols.length) {
          clearInterval(timerId);
          successEl.textContent = 'Memory match complete! You beat the birthday arcade.';
          successEl.classList.remove('hidden');
          if (window.birthdayAudio) window.birthdayAudio.play('celebration');
        }
      } else {
        statusEl.textContent = 'Not a match — but the chaos is still funny.';
        setTimeout(() => {
          first.textContent = '❔';
          second.textContent = '❔';
          first.classList.remove('revealed');
          second.classList.remove('revealed');
          openedCards = [];
        }, 700);
      }
    }
  };

  restartBtn.addEventListener('click', resetBoard);
  resetBoard();
}

function initReactionGame() {
  const root = document.getElementById('reaction-game');
  if (!root) return;

  const cue = root.querySelector('[data-reaction-cue]');
  const result = root.querySelector('[data-reaction-result]');
  const startBtn = root.querySelector('[data-reaction-start]');
  const restartBtn = root.querySelector('[data-reaction-restart]');
  const startScreen = root.querySelector('[data-start-screen]');

  let timeoutId = null;
  let started = false;
  let startedAt = 0;

  const clearCue = () => {
    cue.classList.remove('visible');
    cue.textContent = 'Wait for it...';
  };

  const triggerRound = () => {
    if (timeoutId) clearTimeout(timeoutId);
    clearCue();
    started = false;
    const delay = 800 + Math.random() * 2200;
    timeoutId = setTimeout(() => {
      cue.classList.add('visible');
      cue.textContent = 'CLICK!';
      started = true;
      startedAt = performance.now();
    }, delay);
  };

  cue.addEventListener('click', () => {
    if (!started) {
      result.textContent = 'Too soon. You clicked before the signal appeared.';
      clearCue();
      return;
    }

    const reactionTime = Math.round(performance.now() - startedAt);
    const rating = reactionTime < 250
      ? 'Elite reflexes'
      : reactionTime < 420
        ? 'Very respectable'
        : reactionTime < 700
          ? 'Solid chaos speed'
          : 'A dramatic slowpoke';

    result.textContent = `Reaction time: ${reactionTime} ms — ${rating}.`;
    started = false;
    if (window.birthdayAudio) window.birthdayAudio.play('celebration');
  });

  startBtn.addEventListener('click', () => {
    if (startScreen) startScreen.classList.add('hidden');
    triggerRound();
  });

  restartBtn.addEventListener('click', () => {
    if (startScreen) startScreen.classList.remove('hidden');
    if (timeoutId) clearTimeout(timeoutId);
    clearCue();
    result.textContent = 'Ready for the next challenge.';
    started = false;
  });

  clearCue();
}
