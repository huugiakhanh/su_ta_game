(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const playerSprite = document.getElementById('playerSprite');
  ctx.imageSmoothingEnabled = false;

  // Camera hẹp hơn canvas map 1280 px để cảnh hiển thị lớn và rõ hơn.
  // Kích thước gốc của từng map chunk vẫn giữ nguyên 1280 x 360 px.
  const VIEW_W = 896;
  const VIEW_H = 360;
  const CHUNK_W = 1280;
  const MAP_ROAD_TARGET_Y = 290;
  const GROUND_Y = MAP_ROAD_TARGET_Y;
  const SEAM_BLEND_W = 34;
  const FOOT_MARGIN = 9;
  const MOVE_SPEED = 280;
  const GRAVITY = 2200;
  const JUMP_FORCE = 780;
  const DASH_SPEED = 720;
  const DASH_TIME = 0.30;
  const GROUND_SNAP_DISTANCE = 18;
  const PLAYER_FRAME_SIZE = 96;
  const PLAYER_JUMP_SCALE = 1.25;
  const OBSTACLE_GROUND_SINK = 7;

  // Giữ đúng độ phân giải camera kể cả khi HTML cũ vẫn còn width="1280".
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  ctx.imageSmoothingEnabled = false;

  // Vị trí mặt đường trong từng ảnh gốc. Khi vẽ, code đưa tất cả các điểm này
  // về cùng MAP_ROAD_TARGET_Y để đường không bị giật lên/xuống ở mép nối map.
  const MAP_ROAD_SOURCE_Y = [577, 573, 533, 493, 550, 468, 610, 598, 575, 552, 598, 566];
  // Tài nguyên level được phục vụ từ frontend/static/assets/images.
  // ảnh/mapchunk_1/
  //   contains obstacles.png
  //   map chunk 1.1.png ... map chunk 1.12.png
  //
  const MAP_ROOT_CANDIDATES = ['/static/assets/images/mapchunk_1/'];

  const MAP_FILE_PATTERNS = [number => `map chunk 1.${number}.png`];

  const OBSTACLE_FILE_NAMES = ['contains obstacles.png'];

  const PLAYER_ROOT_CANDIDATES = ['/static/assets/images/characters/origin male/'];

  const PLAYER_ANIMATION_FILES = {
    idle: 'stance.gif',
    run: 'run.gif',
    jump: 'jump.gif',
    dash: 'dash.gif'
  };

  const ui = {
    health: document.getElementById('healthValue'),
    books: document.getElementById('bookValue'),
    score: document.getElementById('scoreValue'),
    progress: document.getElementById('progressBar'),
    loading: document.getElementById('loadingPanel'),
    loadingText: document.getElementById('loadingText'),
    start: document.getElementById('startButton'),
    question: document.getElementById('questionPanel'),
    end: document.getElementById('endPanel'),
    endTitle: document.getElementById('endTitle'),
    endText: document.getElementById('endText'),
    restart: document.getElementById('restartButton'),
    message: document.getElementById('messageBox')
  };

  const images = { maps: [], obstacles: null, player: {}, playerRoot: '' };
  const keys = { left: false, right: false, jump: false, dash: false, attack: false };
  const pressed = { jump: false, dash: false, attack: false };

  let state;
  let lastTime = 0;
  let messageTimer = 0;
  let currentPlayerAnimation = '';

  const atlas = {
    rock:       { col: 0, row: 0 },
    bush:       { col: 1, row: 0 },
    stake:      { col: 2, row: 0 },
    post:       { col: 3, row: 0 },
    barrel:     { col: 0, row: 1 },
    log:        { col: 1, row: 1 },
    spear:      { col: 2, row: 1 },
    punji:      { col: 3, row: 1 },
    trunk:      { col: 0, row: 2 },
    spikeRow:   { col: 1, row: 2 },
    ropeTrap:   { col: 2, row: 2 },
    fence:      { col: 3, row: 2 },
    fallenTree: { col: 0, row: 3 },
    wall:       { col: 1, row: 3 },
    gate:       { col: 2, row: 3 },
    hanGuards:  { col: 3, row: 3 }
  };

  function worldX(chunkNumber, localX) {
    return (chunkNumber - 1) * CHUNK_W + localX;
  }

  function makeObstacle(type, chunk, localX, width, height, options = {}) {
    const drawScale = options.drawScale || 1.65;
    const groundY = options.groundY || groundYAt(worldX(chunk, localX) + width / 2);
    return {
      type,
      x: worldX(chunk, localX),
      y: options.overhead ? groundY - 77 : groundY - height,
      w: width,
      h: options.overhead ? 34 : height,
      drawW: Math.round(width * drawScale),
      drawH: Math.round(height * drawScale),
      groundY,
      harmful: Boolean(options.harmful),
      overhead: Boolean(options.overhead),
      requiresDash: options.requiresDash ?? Boolean(options.overhead),
      active: true
    };
  }

  function groundYAt(worldXPosition) {
    const terrain = [
      // Gò có bia đá trong map chunk 1.7. Các điểm bám đúng mặt dốc của ảnh sau khi
      // ảnh 2048 px được thu về 1280 px và căn mặt đường ở MAP_ROAD_TARGET_Y.
      { x1: worldX(7, 580), x2: worldX(7, 710), y1: GROUND_Y, y2: 216 },
      { x1: worldX(7, 710), x2: worldX(7, 948), y1: 216, y2: 216 },
      { x1: worldX(7, 948), x2: worldX(7, 1020), y1: 216, y2: GROUND_Y }
    ];
    const segment = terrain.find(item => worldXPosition >= item.x1 && worldXPosition <= item.x2);
    if (!segment) return GROUND_Y;
    const t = (worldXPosition - segment.x1) / (segment.x2 - segment.x1);
    return segment.y1 + (segment.y2 - segment.y1) * t;
  }

  function newState() {
    return {
      running: false,
      paused: false,
      won: false,
      cameraX: 0,
      score: 0,
      health: 5,
      booksCollected: 0,
      questionShown: false,
      storyShown: false,
      restUsed: false,
      finishX: worldX(12, 1030),
      player: {
        x: 140,
        y: GROUND_Y - 70,
        w: 42,
        h: 70,
        normalH: 70,
        vx: 0,
        vy: 0,
        facing: 1,
        grounded: true,
        dashing: false,
        dashTimer: 0,
        attacking: false,
        attackTimer: 0,
        attackCooldown: 0,
        invulnerable: 0
      },
      obstacles: [
        makeObstacle('log', 2, 410, 88, 45),
        makeObstacle('fence', 2, 810, 92, 58),
        makeObstacle('rock', 3, 410, 62, 42),
        makeObstacle('bush', 3, 830, 74, 51, { harmful: true }),
        makeObstacle('fallenTree', 5, 450, 155, 112, { overhead: true }),
        makeObstacle('gate', 5, 850, 150, 120, { overhead: true }),
        makeObstacle('barrel', 6, 390, 64, 64),
        makeObstacle('punji', 6, 820, 90, 53, { harmful: true }),
        makeObstacle('spikeRow', 11, 350, 120, 56, { harmful: true })
      ],
      holes: [
        { x: worldX(4, 455), w: 155 },
        // Cầu ở map 1.4 có mặt cầu để đứng. Chỉ giữ một khe gãy nhỏ cần nhảy qua.
        { x: worldX(4, 865), w: 52 }
      ],
      books: [
        { x: worldX(2, 650), y: GROUND_Y - 94, collected: false },
        { x: worldX(3, 650), y: GROUND_Y - 86, collected: false },
        { x: worldX(4, 700), y: GROUND_Y - 145, collected: false },
        { x: worldX(7, 430), y: GROUND_Y - 100, collected: false },
        { x: worldX(7, 930), y: GROUND_Y - 120, collected: false }
      ],
      enemies: [
        { x: worldX(6, 1040), y: GROUND_Y - 82, w: 74, h: 82, hp: 2, maxHp: 2, boss: false, alive: true, hitTimer: 0 },
        { x: worldX(11, 850), y: GROUND_Y - 105, w: 96, h: 105, hp: 5, maxHp: 5, boss: true, alive: true, hitTimer: 0 }
      ]
    };
  }

  function loadImage(src, optional = false) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(optional ? null : { failed: true, src });
      image.src = src;
    });
  }

  function joinAssetPath(root, fileName) {
    return new URL(fileName, new URL(root, document.baseURI)).href;
  }

  async function findAssetSet() {
    for (const root of MAP_ROOT_CANDIDATES) {
      const obstacleSprite = await findObstacleSprite(root);
      if (!obstacleSprite) continue;
      for (const pattern of MAP_FILE_PATTERNS) {
        const firstMapPath = joinAssetPath(root, pattern(1));
        const firstMap = await loadImage(firstMapPath, true);
        if (firstMap && obstacleSprite) {
          return { root, mapPattern: pattern, firstMap, obstacleSprite };
        }
      }
    }
    return {
      root: MAP_ROOT_CANDIDATES[0],
      mapPattern: MAP_FILE_PATTERNS[0],
      firstMap: null,
      obstacleSprite: null
    };
  }

  async function findObstacleSprite(root) {
    for (const fileName of OBSTACLE_FILE_NAMES) {
      const image = await loadImage(joinAssetPath(root, fileName), true);
      if (image) return image;
    }
    return null;
  }

  async function findPlayerAnimations() {
    for (const root of PLAYER_ROOT_CANDIDATES) {
      const entries = await Promise.all(Object.entries(PLAYER_ANIMATION_FILES).map(async ([stateName, fileName]) => [
        stateName,
        await loadImage(joinAssetPath(root, fileName), true)
      ]));
      const animations = Object.fromEntries(entries);
      if (animations.idle) return { root, animations };
    }
    return { root: PLAYER_ROOT_CANDIDATES[0], animations: {} };
  }

  async function loadAssets() {
    const found = await findAssetSet();
    const mapPaths = Array.from({ length: 12 }, (_, index) =>
      joinAssetPath(found.root, found.mapPattern(index + 1))
    );
    const [loadedMaps, playerSet] = await Promise.all([
      Promise.all(mapPaths.map((path, index) =>
        index === 0 && found.firstMap ? Promise.resolve(found.firstMap) : loadImage(path, true)
      )),
      findPlayerAnimations()
    ]);
    images.maps = loadedMaps.map(item => item && !item.failed ? item : null);
    images.obstacles = found.obstacleSprite || await findObstacleSprite(found.root);
    images.player = playerSet.animations;
    images.playerRoot = playerSet.root;

    const missingMaps = images.maps.filter(image => !image).length;
    const missingAnimations = Object.keys(PLAYER_ANIMATION_FILES).filter(name => !images.player[name]);
    const notices = [];
    if (missingMaps) notices.push(`thiếu ${missingMaps} map chunk`);
    if (!images.obstacles) notices.push('thiếu contains obstacles.png');
    if (missingAnimations.length) notices.push(`thiếu GIF nhân vật: ${missingAnimations.join(', ')}`);
    ui.loadingText.textContent = notices.length
      ? `Chưa tải đủ ảnh: ${notices.join('; ')}. Hãy kiểm tra thư mục ảnh.`
      : 'Đã tải đủ 12 map chunk, sheet chướng ngại vật và 4 hoạt ảnh nhân vật.';
    console.info('SUTA asset root:', found.root);
    console.info('SUTA map paths:', mapPaths);
    console.info('SUTA obstacle loaded:', Boolean(images.obstacles));
    console.info('SUTA player root:', images.playerRoot);
    ui.start.disabled = false;
    draw();
  }

  function resetGame(startImmediately = true) {
    state = newState();
    state.running = startImmediately;
    state.paused = false;
    ui.question.classList.remove('panel--visible');
    ui.end.classList.remove('panel--visible');
    ui.loading.classList.toggle('panel--visible', !startImmediately);
    clearInput();
    updateHud();
    showMessage('Thu thập 5 cuốn sách và vượt qua các chướng ngại vật.', 2600);
  }

  function clearInput() {
    Object.keys(keys).forEach(key => { keys[key] = false; });
    pressed.jump = false;
    pressed.dash = false;
    pressed.attack = false;
    document.querySelectorAll('.control').forEach(button => button.classList.remove('is-pressed'));
  }

  function showMessage(text, duration = 1900) {
    ui.message.textContent = text;
    ui.message.classList.add('message--visible');
    messageTimer = duration / 1000;
  }

  function updateHud() {
    ui.health.textContent = state.health;
    ui.books.textContent = `${state.booksCollected}/5`;
    ui.score.textContent = state.score;
    const percent = Math.max(0, Math.min(100, state.player.x / state.finishX * 100));
    ui.progress.style.width = `${percent}%`;
  }

  function pointHasGround(worldXPosition) {
    return !state.holes.some(hole => worldXPosition > hole.x && worldXPosition < hole.x + hole.w);
  }

  function currentGroundExists(player) {
    // Kiểm tra cả hai chân thay vì chỉ lấy tâm nhân vật.
    // Như vậy ở mép hố/cầu nhân vật không bị "giật" hoặc rơi sớm khi hình nền còn thấy đất.
    const leftFoot = player.x + FOOT_MARGIN;
    const rightFoot = player.x + player.w - FOOT_MARGIN;
    return pointHasGround(leftFoot) || pointHasGround(rightFoot);
  }

  function playerGroundY(player, moveDirection = 0) {
    const leftFoot = player.x + FOOT_MARGIN;
    const rightFoot = player.x + player.w - FOOT_MARGIN;
    const samples = [];

    if (pointHasGround(leftFoot)) samples.push({ side: -1, y: groundYAt(leftFoot) });
    if (pointHasGround(rightFoot)) samples.push({ side: 1, y: groundYAt(rightFoot) });
    if (!samples.length) return null;

    // Dùng chân phía trước để nhân vật lên và xuống dốc theo đúng hướng đang chạy.
    if (moveDirection !== 0) {
      const leadingFoot = samples.find(sample => sample.side === Math.sign(moveDirection));
      if (leadingFoot) return leadingFoot.y;
    }
    return Math.min(...samples.map(sample => sample.y));
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function hurtPlayer(reason) {
    const p = state.player;
    if (p.invulnerable > 0 || state.won) return;
    state.health -= 1;
    state.score = Math.max(0, state.score - 50);
    p.invulnerable = 1.25;
    p.dashing = false;
    p.dashTimer = 0;
    p.vy = -330;
    p.vx = -230 * p.facing;
    showMessage(reason);
    if (state.health <= 0) endGame(false);
  }

  function respawnAfterFall() {
    const p = state.player;
    state.health -= 1;
    if (state.health <= 0) {
      endGame(false);
      return;
    }
    const chunkStart = Math.floor(p.x / CHUNK_W) * CHUNK_W;
    p.x = Math.max(80, chunkStart + 120);
    p.y = groundYAt(p.x + p.w / 2) - p.normalH;
    p.h = p.normalH;
    p.dashing = false;
    p.dashTimer = 0;
    p.vx = 0;
    p.vy = 0;
    p.invulnerable = 1.5;
    showMessage('Bạn rơi xuống hố và mất 1 máu.');
  }

  function startAttack() {
    const p = state.player;
    if (p.attackCooldown > 0) return;
    p.attacking = true;
    p.attackTimer = .18;
    p.attackCooldown = .36;

    const attackBox = {
      x: p.facing > 0 ? p.x + p.w : p.x - 80,
      y: p.y + 12,
      w: 80,
      h: Math.max(42, p.h - 16)
    };
    state.enemies.forEach(enemy => {
      if (!enemy.alive || enemy.hitTimer > 0 || !aabb(attackBox, enemy)) return;
      enemy.hp -= 1;
      enemy.hitTimer = .18;
      state.score += enemy.boss ? 150 : 100;
      if (enemy.hp <= 0) {
        enemy.alive = false;
        state.score += enemy.boss ? 700 : 250;
        showMessage(enemy.boss ? 'Đã đánh bại toán lính giữ thành!' : 'Đã đánh bại lính canh.');
      }
    });
  }

  // Cơ chế lướt lấy theo level-test: một cú lao nhanh, có thời gian cố định,
  // không thu nhỏ nhân vật thành tư thế quỳ và có thể dùng cả khi đang ở trên không.
  function startDash() {
    const p = state.player;
    if (p.dashing) return;
    p.dashing = true;
    p.dashTimer = DASH_TIME;
    p.vx = p.facing * DASH_SPEED;
  }

  function update(dt) {
    if (!state.running || state.paused || state.won) return;
    const p = state.player;
    const previousBottom = p.y + p.h;

    if (messageTimer > 0) {
      messageTimer -= dt;
      if (messageTimer <= 0) ui.message.classList.remove('message--visible');
    }

    p.invulnerable = Math.max(0, p.invulnerable - dt);
    p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    p.attackTimer = Math.max(0, p.attackTimer - dt);
    p.attacking = p.attackTimer > 0;
    state.enemies.forEach(enemy => { enemy.hitTimer = Math.max(0, enemy.hitTimer - dt); });

    const move = Number(keys.right) - Number(keys.left);
    if (!p.dashing && move !== 0) p.facing = move;

    if (pressed.dash) startDash();
    pressed.dash = false;

    if (p.dashing) {
      p.dashTimer -= dt;
      p.vx = p.facing * DASH_SPEED;
    } else {
      p.vx = move * MOVE_SPEED;
    }

    if (pressed.jump && p.grounded && !p.dashing) {
      p.vy = -JUMP_FORCE;
      p.grounded = false;
    }
    pressed.jump = false;

    if (pressed.attack) startAttack();
    pressed.attack = false;

    const wasGrounded = p.grounded;
    p.vy += GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.x = Math.max(20, Math.min(state.finishX + 160, p.x));

    p.grounded = false;
    const groundY = playerGroundY(p, move);
    const feetY = p.y + p.h;
    const mayFollowSlope = wasGrounded && groundY !== null && Math.abs(feetY - groundY) <= GROUND_SNAP_DISTANCE;
    const landedOnGround = groundY !== null && feetY >= groundY && p.vy >= 0;
    if (mayFollowSlope || landedOnGround) {
      p.y = groundY - p.h;
      p.vy = 0;
      p.grounded = true;
    }

    for (const obstacle of state.obstacles) {
      if (!obstacle.active || !aabb(p, obstacle)) continue;
      // Chướng ngại vật bắt buộc lướt không gây sát thương trong suốt cú dash.
      if (obstacle.requiresDash && p.dashing) continue;
      if (!obstacle.overhead && !obstacle.harmful && p.vy >= 0 && previousBottom <= obstacle.y + 8) {
        p.y = obstacle.y - p.h;
        p.vy = 0;
        p.grounded = true;
      } else {
        hurtPlayer(obstacle.harmful ? 'Bạn va vào bẫy!' : 'Hãy nhảy hoặc lướt qua chướng ngại vật.');
      }
    }

    // Nếu thời gian lướt vừa hết khi nhân vật còn nằm trong vùng vật cản,
    // duy trì dash tới khi ra khỏi vật để không bị mất máu ở khung hình cuối.
    const insideDashObstacle = state.obstacles.some(obstacle =>
      obstacle.active && obstacle.requiresDash && aabb(p, obstacle)
    );
    if (p.dashing && p.dashTimer <= 0 && !insideDashObstacle) {
      p.dashing = false;
      p.dashTimer = 0;
    }

    state.books.forEach(book => {
      if (book.collected) return;
      const hitbox = { x: book.x - 18, y: book.y - 22, w: 36, h: 44 };
      if (aabb(p, hitbox)) {
        book.collected = true;
        state.booksCollected += 1;
        state.score += 200;
        showMessage(`Đã thu thập sách lịch sử ${state.booksCollected}/5`);
      }
    });

    state.enemies.forEach(enemy => {
      if (!enemy.alive || p.invulnerable > 0) return;
      if (aabb(p, enemy)) hurtPlayer(enemy.boss ? 'Lính giữ thành phản công!' : 'Bạn bị lính canh đánh trúng!');
    });

    if (!state.questionShown && p.x > worldX(8, 520)) {
      state.questionShown = true;
      state.paused = true;
      clearInput();
      ui.question.classList.add('panel--visible');
    }

    if (!state.restUsed && p.x > worldX(9, 470)) {
      state.restUsed = true;
      state.health = Math.min(5, state.health + 1);
      showMessage('Nghỉ chân: hồi 1 máu.');
    }

    if (!state.storyShown && p.x > worldX(10, 520)) {
      state.storyShown = true;
      showMessage('Mê Linh, năm 40: nghĩa quân tập hợp, chuẩn bị phất cờ khởi nghĩa.', 3600);
    }

    const bossAlive = state.enemies.some(enemy => enemy.boss && enemy.alive);
    if (p.x >= state.finishX) {
      if (bossAlive) {
        p.x = state.finishX - 30;
        p.vx = 0;
        showMessage('Hãy đánh bại lính giữ thành trước khi về đích.');
      } else if (state.booksCollected < 5) {
        p.x = state.finishX - 30;
        p.vx = 0;
        showMessage(`Bạn còn thiếu ${5 - state.booksCollected} cuốn sách lịch sử.`);
      } else {
        endGame(true);
      }
    }

    if (p.y > VIEW_H + 160) respawnAfterFall();

    const targetCamera = p.x - VIEW_W * .34;
    const maxCamera = CHUNK_W * images.maps.length - VIEW_W;
    state.cameraX += (Math.max(0, Math.min(maxCamera, targetCamera)) - state.cameraX) * Math.min(1, dt * 6);
    updateHud();
  }

  function endGame(won) {
    state.won = true;
    state.running = false;
    clearInput();
    ui.endTitle.textContent = won ? 'Hoàn thành màn thử!' : 'Bạn đã thất bại';
    ui.endText.textContent = won
      ? `Bạn thu thập ${state.booksCollected}/5 sách và đạt ${state.score} điểm.`
      : `Điểm đạt được: ${state.score}. Hãy thử lại nhé.`;
    ui.end.classList.add('panel--visible');
  }

  function drawFallbackMap(index, screenX) {
    const colors = ['#8bc9dc', '#86c1d0', '#91c7ce', '#78b4c2'];
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(screenX, 0, CHUNK_W, VIEW_H);
    ctx.fillStyle = '#73966a';
    ctx.fillRect(screenX, 210, CHUNK_W, 100);
    ctx.fillStyle = '#795238';
    ctx.fillRect(screenX, GROUND_Y, CHUNK_W, VIEW_H - GROUND_Y);
  }

  function drawMaps() {
    const first = Math.max(0, Math.floor(state.cameraX / CHUNK_W));
    const last = Math.min(images.maps.length - 1, first + 1);
    for (let i = first; i <= last; i += 1) {
      const screenX = Math.round(i * CHUNK_W - state.cameraX);
      const image = images.maps[i];
      if (image) {
        // Giữ đúng tỉ lệ ảnh gốc, cắt phần thừa trên/dưới và căn mặt đường bằng nhau.
        const scale = CHUNK_W / image.width;
        const drawHeight = image.height * scale;
        const roadSourceY = MAP_ROAD_SOURCE_Y[i] || image.height * .74;
        const drawY = MAP_ROAD_TARGET_Y - roadSourceY * scale;
        ctx.drawImage(image, screenX, Math.round(drawY), CHUNK_W, Math.ceil(drawHeight));
      }
      else drawFallbackMap(i, screenX);
    }
    drawSeamBlends(first, last);
  }

  function drawSeamBlends(first, last) {
    // Che nhẹ đường ráp giữa 2 mapchunk. Nếu 2 ảnh nền lệch vài pixel thì mắt sẽ thấy mềm hơn,
    // vẫn giữ từng chunk riêng để dễ thay ảnh/sửa màn chơi.
    ctx.save();
    for (let seam = first + 1; seam <= last; seam += 1) {
      const seamX = Math.round(seam * CHUNK_W - state.cameraX);
      const x = seamX - SEAM_BLEND_W / 2;
      const gradient = ctx.createLinearGradient(x, 0, x + SEAM_BLEND_W, 0);
      gradient.addColorStop(0, 'rgba(35, 67, 45, 0)');
      gradient.addColorStop(.5, 'rgba(35, 67, 45, .16)');
      gradient.addColorStop(1, 'rgba(35, 67, 45, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, 188, SEAM_BLEND_W, VIEW_H - 188);

      ctx.fillStyle = 'rgba(76, 105, 54, .20)';
      ctx.fillRect(x, MAP_ROAD_TARGET_Y - 3, SEAM_BLEND_W, 12);
      ctx.fillStyle = 'rgba(88, 61, 38, .18)';
      ctx.fillRect(x, MAP_ROAD_TARGET_Y + 9, SEAM_BLEND_W, 28);
    }
    ctx.restore();
  }

  function drawAtlasSprite(name, x, y, width, height, alpha = 1) {
    const image = images.obstacles;
    if (!image) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(Math.round(x), Math.round(y), width, height);
      ctx.globalAlpha = 1;
      return;
    }
    const source = atlas[name];
    const cellW = image.width / 4;
    const cellH = image.height / 4;
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      image,
      source.col * cellW, source.row * cellH, cellW, cellH,
      Math.round(x), Math.round(y), width, height
    );
    ctx.globalAlpha = 1;
  }

  function drawBooks(time) {
    state.books.forEach((book, index) => {
      if (book.collected) return;
      const x = book.x - state.cameraX;
      if (x < -60 || x > VIEW_W + 60) return;
      const y = book.y + Math.sin(time * 4 + index) * 5;
      ctx.fillStyle = 'rgba(255, 210, 80, .26)';
      ctx.fillRect(Math.round(x - 24), Math.round(y - 28), 48, 55);
      ctx.fillStyle = '#f4d05c';
      ctx.fillRect(Math.round(x - 15), Math.round(y - 19), 30, 38);
      ctx.fillStyle = '#8b2820';
      ctx.fillRect(Math.round(x - 12), Math.round(y - 16), 12, 32);
      ctx.fillStyle = '#fff0ad';
      ctx.fillRect(Math.round(x + 1), Math.round(y - 15), 11, 30);
      ctx.fillStyle = '#5a1d1a';
      ctx.fillRect(Math.round(x - 2), Math.round(y - 18), 4, 36);
    });
  }

  function drawObstacles() {
    state.obstacles.forEach(obstacle => {
      if (!obstacle.active) return;
      const x = obstacle.x - state.cameraX - (obstacle.drawW - obstacle.w) / 2;
      if (x + obstacle.drawW < -80 || x > VIEW_W + 80) return;
      // Neo theo mặt đất thật tại vị trí vật cản và chìm nhẹ 7 px để phần trong
      // suốt ở đáy ô sprite không khiến chướng ngại vật trông như đang bay.
      const drawY = obstacle.groundY - obstacle.drawH + OBSTACLE_GROUND_SINK;
      drawAtlasSprite(obstacle.type, x, drawY, obstacle.drawW, obstacle.drawH);
    });
  }

  function drawEnemies() {
    state.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      const x = enemy.x - state.cameraX;
      if (x + enemy.w < -80 || x > VIEW_W + 80) return;
      drawAtlasSprite('hanGuards', x, enemy.y, enemy.w, enemy.h, enemy.hitTimer > 0 ? .45 : 1);
      ctx.fillStyle = '#2b110d';
      ctx.fillRect(Math.round(x), Math.round(enemy.y - 12), enemy.w, 6);
      ctx.fillStyle = enemy.boss ? '#e34c36' : '#e2ad45';
      ctx.fillRect(Math.round(x + 1), Math.round(enemy.y - 11), (enemy.w - 2) * enemy.hp / enemy.maxHp, 4);
    });
  }

  function drawPlayer() {
    const p = state.player;
    const x = Math.round(p.x - state.cameraX);
    const y = Math.round(p.y);
    const blinkHidden = p.invulnerable > 0 && Math.floor(p.invulnerable * 12) % 2 === 0;

    const animationName = p.dashing ? 'dash' : !p.grounded ? 'jump' : Math.abs(p.vx) > 1 ? 'run' : 'idle';
    const playerImage = images.player[animationName] || images.player.idle;
    if (playerSprite && playerImage) {
      // Để trình duyệt chạy GIF trực tiếp trong một phần tử HTML giống level-test.
      // Canvas chỉ còn vẽ map, vì vẽ GIF vào canvas có thể bị giữ ở khung đầu.
      const scale = animationName === 'jump' ? PLAYER_JUMP_SCALE : 1;
      const drawX = x + p.w / 2 - PLAYER_FRAME_SIZE / 2;
      const footY = y + p.h;
      if (currentPlayerAnimation !== animationName) {
        const imageUrl = playerImage.currentSrc || playerImage.src;
        playerSprite.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
        currentPlayerAnimation = animationName;
      }
      playerSprite.hidden = false;
      playerSprite.style.left = `${drawX / VIEW_W * 100}%`;
      playerSprite.style.bottom = `${(VIEW_H - footY) / VIEW_H * 100}%`;
      playerSprite.style.width = `${PLAYER_FRAME_SIZE / VIEW_W * 100}%`;
      playerSprite.style.height = `${PLAYER_FRAME_SIZE / VIEW_H * 100}%`;
      playerSprite.style.transform = `scaleX(${p.facing < 0 ? -1 : 1}) scale(${scale})`;
      playerSprite.style.visibility = blinkHidden ? 'hidden' : 'visible';
      playerSprite.classList.toggle('is-dashing', p.dashing);
    } else {
      if (playerSprite) playerSprite.hidden = true;
      if (blinkHidden) return;
      // Nhân vật pixel tạm để game chạy ngay khi chưa có sprite Trưng Trắc.
      ctx.save();
      ctx.translate(x + (p.facing < 0 ? p.w : 0), y);
      ctx.scale(p.facing, 1);
      ctx.fillStyle = '#2b1710';
      ctx.fillRect(12, 0, 18, 15);
      ctx.fillStyle = '#c98c61';
      ctx.fillRect(13, 8, 16, 16);
      ctx.fillStyle = '#40151a';
      ctx.fillRect(8, 22, 28, Math.max(15, p.h - 38));
      ctx.fillStyle = '#d2a33e';
      ctx.fillRect(7, 29, 31, 7);
      ctx.fillStyle = '#6f2427';
      ctx.fillRect(8, p.h - 18, 10, 18);
      ctx.fillRect(27, p.h - 18, 10, 18);
      if (p.attacking) {
        ctx.fillStyle = '#d7d5c8';
        ctx.fillRect(35, 25, 42, 5);
        ctx.fillStyle = '#6c431f';
        ctx.fillRect(30, 23, 12, 9);
      }
      ctx.restore();
    }
  }

  function drawChunkMarker() {
    const chunk = Math.min(12, Math.floor(state.player.x / CHUNK_W) + 1);
    ctx.fillStyle = 'rgba(24, 14, 9, .72)';
    ctx.fillRect(VIEW_W - 105, 12, 90, 28);
    ctx.fillStyle = '#ffe7a3';
    ctx.font = 'bold 15px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${chunk} / 12`, VIEW_W - 60, 32);
  }

  function draw(time = 0) {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    drawMaps();
    if (!state) return;
    drawBooks(time);
    drawObstacles();
    drawEnemies();
    drawPlayer();
    drawChunkMarker();
  }

  function frame(timestamp) {
    const dt = Math.min(.032, Math.max(0, (timestamp - lastTime) / 1000 || 0));
    lastTime = timestamp;
    if (state) update(dt);
    if (state) draw(timestamp / 1000);
    requestAnimationFrame(frame);
  }

  function setKey(code, down) {
    const mapping = {
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
      ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
      ArrowDown: 'dash', KeyS: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash', KeyK: 'dash',
      KeyJ: 'attack'
    };
    const action = mapping[code];
    if (!action) return false;
    if (down && !keys[action] && (action === 'jump' || action === 'dash' || action === 'attack')) pressed[action] = true;
    keys[action] = down;
    return true;
  }

  window.addEventListener('keydown', event => {
    if (event.code === 'KeyR') {
      resetGame(true);
      return;
    }
    if (setKey(event.code, true)) event.preventDefault();
  });
  window.addEventListener('keyup', event => {
    if (setKey(event.code, false)) event.preventDefault();
  });
  window.addEventListener('blur', clearInput);

  document.querySelectorAll('[data-control]').forEach(button => {
    const action = button.dataset.control;
    const press = event => {
      event.preventDefault();
      if (!keys[action] && (action === 'jump' || action === 'dash' || action === 'attack')) pressed[action] = true;
      keys[action] = true;
      button.classList.add('is-pressed');
      button.setPointerCapture?.(event.pointerId);
    };
    const release = event => {
      event.preventDefault();
      keys[action] = false;
      button.classList.remove('is-pressed');
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('contextmenu', event => event.preventDefault());
  });

  ui.start.addEventListener('click', () => {
    ui.loading.classList.remove('panel--visible');
    resetGame(true);
  });
  ui.restart.addEventListener('click', () => resetGame(true));

  document.querySelectorAll('[data-answer]').forEach(button => {
    button.addEventListener('click', () => {
      const correct = button.dataset.answer === 'correct';
      if (correct) {
        state.score += 500;
        showMessage('Chính xác! Khởi nghĩa Hai Bà Trưng bùng nổ năm 40 SCN.', 3000);
      } else {
        state.health -= 1;
        showMessage('Chưa đúng. Đáp án là năm 40 SCN; bạn mất 1 máu.', 3000);
        if (state.health <= 0) {
          ui.question.classList.remove('panel--visible');
          endGame(false);
          return;
        }
      }
      ui.question.classList.remove('panel--visible');
      state.paused = false;
      updateHud();
    });
  });

  state = newState();
  updateHud();
  loadAssets();
  requestAnimationFrame(frame);
})();
