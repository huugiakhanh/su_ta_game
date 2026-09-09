(() => {
  'use strict';

  const playerEl = document.getElementById('player');
  const stageEl = document.getElementById('stage');
  const FRAME_SIZE = 128;
  const GRAVITY = 2200;
  const MOVE_SPEED = 280;
  const JUMP_FORCE = 780;
  const DASH_SPEED = 720;
  const DASH_TIME = 0.18;
  let currentAnimState = '';

  const animImages = {
    idle: "url('/static/assets/images/characters/origin male/stance.gif')",
    run: "url('/static/assets/images/characters/origin male/run.gif')",
    jump: "url('/static/assets/images/characters/origin male/jump.gif')",
    dash: "url('/static/assets/images/characters/origin male/dash.gif')",
  };
  const keys = { left: false, right: false };
  const player = {
    x: 120, y: 0, vx: 0, vy: 0, direction: 1, grounded: true,
    dashing: false, dashTimer: 0, state: 'idle',
  };
  let lastTime = performance.now();

  function setKey(code, isDown) {
    if (code === 'ArrowLeft' || code === 'KeyA') keys.left = isDown;
    if (code === 'ArrowRight' || code === 'KeyD') keys.right = isDown;
  }

  function jump() {
    if (!player.grounded || player.dashing) return;
    player.vy = JUMP_FORCE;
    player.grounded = false;
  }

  function dash() {
    if (player.dashing) return;
    player.dashing = true;
    player.dashTimer = DASH_TIME;
    player.vx = player.direction * DASH_SPEED;
  }

  function chooseState() {
    if (player.dashing) return 'dash';
    if (!player.grounded) return 'jump';
    if (keys.left || keys.right) return 'run';
    return 'idle';
  }

  function setAnimation(nextState) {
    if (player.state === nextState) return;
    player.state = nextState;
    if (player.state !== currentAnimState) {
      playerEl.style.backgroundImage = animImages[player.state] || animImages.idle;
      currentAnimState = player.state;
    }
  }

  function update(delta) {
    const maxX = stageEl.clientWidth - FRAME_SIZE;
    if (player.dashing) {
      player.dashTimer -= delta;
      if (player.dashTimer <= 0) player.dashing = false;
    } else {
      player.vx = 0;
      if (keys.left) { player.vx = -MOVE_SPEED; player.direction = -1; }
      if (keys.right) { player.vx = MOVE_SPEED; player.direction = 1; }
    }

    player.vy -= GRAVITY * delta;
    player.x += player.vx * delta;
    player.y += player.vy * delta;
    if (player.y <= 0) {
      player.y = 0;
      player.vy = 0;
      player.grounded = true;
    } else {
      player.grounded = false;
    }
    player.x = Math.max(0, Math.min(maxX, player.x));
    setAnimation(chooseState());
    render();
  }

  function render() {
    playerEl.style.left = `${player.x}px`;
    playerEl.style.bottom = `${92 + player.y}px`;
    const scale = player.state === 'jump' ? 1.5 : 1;
    const direction = player.direction === -1 ? -1 : 1;
    playerEl.style.transform = `scaleX(${direction}) scale(${scale})`;
    playerEl.classList.toggle('dashing', player.dashing);
  }

  function gameLoop(now) {
    const delta = Math.min((now - lastTime) / 1000, 0.033);
    lastTime = now;
    update(delta);
    requestAnimationFrame(gameLoop);
  }

  document.addEventListener('keydown', event => {
    setKey(event.code, true);
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
      event.preventDefault();
      jump();
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight' || event.code === 'KeyK') dash();
  });
  document.addEventListener('keyup', event => setKey(event.code, false));

  document.querySelectorAll('.control-btn').forEach(button => {
    const action = button.dataset.key;
    button.addEventListener('pointerdown', () => {
      if (action === 'left') keys.left = true;
      if (action === 'right') keys.right = true;
      if (action === 'jump') jump();
      if (action === 'dash') dash();
    });
    const release = () => {
      if (action === 'left') keys.left = false;
      if (action === 'right') keys.right = false;
    };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointerleave', release);
  });

  setAnimation('idle');
  render();
  requestAnimationFrame(gameLoop);
})();
