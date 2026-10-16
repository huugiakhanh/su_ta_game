// Quân địch (state.enemies): hành vi chung + animation + xoá sau khi phát xong
// death, và hàng đợi sinh quân theo đợt. Hai hành vi chung (`behavior` trong
// CHAPTER.sprites.enemies[art]), thông số ở `rules` của sprite đó:
//   guard  — lính canh: đi tuần, người chơi vào tầm thì tiến tới, đâm.
//   rusher — quân cảm tử: chạy về phía người chơi, chạm tường quay đầu, đâm rồi nghỉ.
// Enemy có `kind` riêng của chương (boss...) do CHAPTER.enemyKinds[kind].update lo.

import { state, enemyArtKey } from './state.js';
import { aabb } from './geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength } from './animation.js';
import { CHAPTER, LEVEL } from './chapter.js';
import { playSfx } from './audio.js';
import { hurtPlayer, playerImmune } from './damage.js';

// Mũi kích/giáo của lính: dải rộng `reach` ngay trước mặt, cao boxH từ
// boxY tính từ đỉnh hitbox.
function meleeBox(enemy, rules) {
  return {
    x: enemy.facing > 0 ? enemy.x + enemy.w : enemy.x - rules.attackReach,
    y: enemy.y + rules.attackBoxY,
    w: rules.attackReach,
    h: rules.attackBoxH
  };
}

// Cú đâm đang diễn: gây sát thương khi animation ở đúng ô hit_frame (chỉ trong
// ô đó, 1 lần/cú); hết animation thì `onEnd` (bắt đầu nghỉ). Bị chém trúng
// giữa chừng thì cú đâm bị huỷ.
function advanceMeleeAttack(enemy, dt, art, onEnd) {
  const meta = getAnimMeta(art.id, art.anims.attack);
  const action = enemy.action;
  if (!meta || enemy.hitTimer > 0) {
    enemy.action = null;
    onEnd();
    return;
  }
  action.time += dt;
  const start = hitTime(meta);
  const p = state.player;
  if (!action.hit && action.time >= start && action.time < start + 1 / meta.fps
    && !playerImmune(p) && aabb(p, meleeBox(enemy, art.rules))) {
    action.hit = true;
    hurtPlayer(art.attackMessage);
  }
  if (action.time >= animLength(meta)) {
    enemy.action = null;
    onEnd();
  }
}

// Lính canh: đi tuần trong [patrolMin, patrolMax]; người chơi trong aggroRange
// -> quay về phía người chơi và tiến lại (không ra khỏi đoạn tuần tra); tới
// tầm kích thì đứng lại đâm. Không bị đẩy lùi khi trúng đòn.
function updateGuard(enemy, dt, art) {
  const rules = art.rules;
  enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
  if (enemy.action) {
    enemy.walking = false;
    advanceMeleeAttack(enemy, dt, art, () => { enemy.attackCooldown = rules.attackCooldown; });
    return;
  }
  const p = state.player;
  const center = enemy.x + enemy.w / 2;
  const toPlayer = p.x + p.w / 2 - center;
  let direction;
  // aggroRange riêng của từng lính (vd. lính đấu trường = cả đấu trường), mặc định rules.
  if (Math.abs(toPlayer) <= (enemy.aggroRange ?? rules.aggroRange)) {
    enemy.facing = Math.sign(toPlayer) || -1;
    const gap = Math.abs(toPlayer) - (p.w + enemy.w) / 2;
    if (gap <= rules.attackReach - 4) {
      enemy.walking = false;
      if (enemy.attackCooldown <= 0 && enemy.hitTimer <= 0) enemy.action = { time: 0, hit: false };
      return;
    }
    direction = enemy.facing;
  } else {
    // Bước kế tiếp sẽ ra khỏi đoạn tuần tra -> quay đầu.
    direction = enemy.facing;
    const step = direction * rules.speed * dt;
    if (center + step < enemy.patrolMin) direction = 1;
    else if (center + step > enemy.patrolMax) direction = -1;
    enemy.facing = direction;
  }
  // Đuổi theo người chơi thì dừng ở mép đoạn tuần tra (không ra khỏi đoạn).
  const nextCenter = center + direction * rules.speed * dt;
  enemy.walking = nextCenter >= enemy.patrolMin && nextCenter <= enemy.patrolMax;
  if (enemy.walking) enemy.x += direction * rules.speed * dt;
}

// Quân cảm tử (TT-BOSS-01 §3.3): chạy theo `direction` (chọn về phía người
// chơi lúc xuất hiện và sau mỗi lần nghỉ), chạm tường màn thì quay đầu; người
// chơi ở phía trước trong attackRange -> đâm (sát thương ở ô hit_frame), rồi
// nghỉ `rest` giây. Không bị đẩy lùi.
function updateRusher(enemy, dt, art) {
  const rules = art.rules;
  const p = state.player;
  const toPlayer = p.x + p.w / 2 - (enemy.x + enemy.w / 2);
  if (enemy.action) {
    enemy.walking = false;
    advanceMeleeAttack(enemy, dt, art, () => { enemy.rest = rules.rest; });
    return;
  }
  if (enemy.rest > 0) {
    enemy.walking = false;
    enemy.rest -= dt;
    if (enemy.rest <= 0) enemy.direction = Math.sign(toPlayer) || enemy.direction;
    enemy.facing = enemy.direction;
    return;
  }
  const gap = Math.abs(toPlayer) - (p.w + enemy.w) / 2;
  if (Math.sign(toPlayer) === enemy.direction && gap <= rules.attackRange) {
    enemy.walking = false;
    enemy.facing = enemy.direction;
    enemy.action = { time: 0, hit: false };
    return;
  }
  enemy.walking = true;
  enemy.x += enemy.direction * rules.speed * dt;
  if (enemy.x <= 0) {
    enemy.x = 0;
    enemy.direction = 1;
  } else if (enemy.x + enemy.w >= LEVEL.worldWidth) {
    enemy.x = LEVEL.worldWidth - enemy.w;
    enemy.direction = -1;
  }
  enemy.facing = enemy.direction;
}

// Hành vi + animation từng quân, rồi xoá quân đã phát xong death. Trạng thái
// animation: death > hurt > attack > walk > idle.
export function updateEnemies(dt) {
  state.enemies.forEach(enemy => {
    const kind = CHAPTER.enemyKinds?.[enemy.kind];
    if (kind) {
      kind.update(enemy, dt);
      return;
    }
    const art = CHAPTER.sprites.enemies[enemyArtKey(enemy)];
    if (!enemy.boss && enemy.alive) {
      if (art.behavior === 'rusher') updateRusher(enemy, dt, art);
      else if (!enemy.harmless) updateGuard(enemy, dt, art);
    }
    let next = 'idle';
    if (enemy.dying) next = 'death';
    else if (enemy.hitTimer > 0 && art.anims.hurt) next = 'hurt';
    else if (enemy.action && art.anims.attack) next = 'attack';
    else if (enemy.walking && art.anims.walk) next = 'walk';
    setAnim(enemy, next);
    tickAnim(enemy, dt);
    // Cú đâm vẽ theo đúng đồng hồ của action để ô hit_frame khớp lúc gây sát thương.
    if (next === 'attack') enemy.anim.time = enemy.action.time;
    // Không có `idle` riêng (vd. quân cảm tử): đứng ở ô 1 của strip chạy.
    if (next === 'idle' && art.idleHold) enemy.anim.time = 0;
    if (enemy.dying) {
      const meta = getAnimMeta(art.id, art.anims.death);
      if (!meta || enemy.anim.time >= animLength(meta)) enemy.dying = false;
    }
  });
  state.enemies = state.enemies.filter(enemy => enemy.alive || enemy.dying);
}

// Quân chạm thân người chơi (không đang miễn thương): enemy `kind` riêng thì
// chương quyết định (onContact); boss -> CHAPTER.text.bossContact; còn lại
// `contactMessage` của sprite.
export function touchEnemies(p) {
  state.enemies.forEach(enemy => {
    if (!enemy.alive || enemy.harmless || enemy.passive || playerImmune(p)) return;
    if (!aabb(p, enemy)) return;
    const kind = CHAPTER.enemyKinds?.[enemy.kind];
    if (kind?.onContact) kind.onContact(enemy, p);
    else if (enemy.boss) hurtPlayer(CHAPTER.text.bossContact);
    else hurtPlayer(CHAPTER.sprites.enemies[enemyArtKey(enemy)].contactMessage);
  });
}

// Sinh quân theo nhóm (entities.js makeSpawner): nhóm sau bắt đầu khi quân của
// nhóm trước chết hết + gap giây; trong nhóm, mỗi quân ra ở giây `at` tính từ
// đầu nhóm, tại spawner.x + dx (spawner.spawn dựng quân).
function spawnEntry(spawner, entry) {
  state.enemies.push(spawner.spawn(entry, spawner.x + (entry.dx || 0)));
}

export function updateSpawner(dt) {
  const spawner = state.spawner;
  if (!spawner) return;
  if (spawner.pending.length) {
    spawner.time += dt;
    while (spawner.pending.length && spawner.pending[0].at <= spawner.time) spawnEntry(spawner, spawner.pending.shift());
    return;
  }
  if (state.enemies.some(enemy => enemy.alive && !enemy.harmless)) {
    spawner.wait = spawner.gap;
    return;
  }
  if (spawner.index >= spawner.groups.length) {
    if (!spawner.loop) {
      spawner.done = true;
      return;
    }
    spawner.index = 0;
  }
  spawner.wait -= dt;
  if (spawner.wait > 0) return;
  spawner.pending = [...spawner.groups[spawner.index]].sort((a, b) => a.at - b.at);
  if (spawner.sfx) playSfx(spawner.sfx);
  spawner.index += 1;
  spawner.time = 0;
  spawner.wait = spawner.gap;
  while (spawner.pending.length && spawner.pending[0].at <= 0) spawnEntry(spawner, spawner.pending.shift());
}
