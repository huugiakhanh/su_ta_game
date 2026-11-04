// Hazard (vật cản/kẻ địch CÓ TRẠNG THÁI) + đạn. Mỗi `kind` là một hành vi
// tách bạch, dùng chung mọi chương; asset/hitbox/câu thông báo theo
// CHAPTER.sprites.hazards[sprite]:
//   roller  — nằm chờ tới khi người chơi vượt triggerX (hoặc bị gọi bằng báo
//             động) rồi lao sang trái, ra khỏi tầm thì xoá.
//   thrower — đứng yên, vào tầm thì bắn đạn theo chu kỳ.
//   trap    — đứng yên, vô hại tới khi người chơi tới sát thì bật (animation
//             `sprung`) và bắt đầu gây sát thương.
//   prop    — chỉ để vẽ, không va chạm.
//   patrol  — mini-boss đi tuần, vào tầm thì đứng lại ném.
//   vent    — vùng phun theo nhịp (chướng khí — BT-ENGINE E8): off -> warn ->
//             active -> off theo `cycle` của sprite, chỉ gây sát thương lúc active.
//   snare   — bẫy rơi từ trên (lưới trúc — LND-ENGINE E3): công tắc ẩn trên mặt
//             đất, chạm thì báo hiệu `warnTime` rồi rơi; trúng thì −máu + choáng
//             `stun` giây; chạm đất thì nằm lại vô hại. Mỗi lượt 1 lần.
//   drift   — khói trôi ngang (chướng khí — TQP-ENGINE E2): làn thấp/cao, vào tầm
//             thì trôi hết quãng `travel`, nghỉ `gap` giây rồi trôi lại.
//   lurker  — vật ngoi lên từ khe nước (cá sấu — TQP-ENGINE E3): báo bọt -> ngoi
//             đớp (chỉ lúc này gây sát thương + chém được) -> lặn, nghỉ `rest`.
// Tuỳ chọn `callHelp` (E4 — thuyền tuần tiễu): người chơi ở gần đủ lâu mà
// hazard chưa bị phá thì phát tín hiệu, gọi lính lên bờ (1 lần mỗi lượt).
// Hazard có `ride` (sprite) mang một bục một chiều trên lưng (E7 — voi rừng):
// bục đi theo hazard; người chơi đứng trên lưng thì không bị va chạm thân.
// Hazard đang chết (dying) chỉ phát nốt animation, không va chạm/di chuyển.

import { state } from './state.js';
import { showMessage } from './ui.js';
import { aabb, groundYAt, makeProjectile } from './geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength } from './animation.js';
import {
  VIEW_W, VIEW_H, GRAVITY, PROJECTILE_SPEED, PROJECTILE_MAX_RANGE, HAZARD_DESPAWN_MARGIN, GROUND_SNAP_DISTANCE
} from './config.js';
import { CHAPTER } from './chapter.js';
import { playSfx } from './audio.js';
import { hurtPlayer, stunPlayer, playerImmune, playerHidden } from './damage.js';
import { revealCarriedItems } from './combat.js';
import { makeEnemy } from './entities.js';

const spriteOf = hazard => CHAPTER.sprites.hazards[hazard.sprite];

// Animation manifest (+ thời lượng ép, nếu có) của một trạng thái hazard.
function hazardAnim(hazard, animState) {
  const sprite = spriteOf(hazard);
  const name = sprite?.anims[animState];
  const meta = name ? getAnimMeta(sprite.id, name) : null;
  return { meta, duration: sprite?.durations?.[animState] ?? null };
}

function fireProjectile(hazard) {
  const player = state.player;
  const originX = hazard.x + hazard.w / 2;
  const direction = Math.sign(player.x + player.w / 2 - originX) || -1;
  // Đạn sinh ở độ cao `muzzle` so với chân — ngang tay ném; cách tâm `muzzleX`
  // (mặc định ngay ngoài mép hitbox).
  const spec = spriteOf(hazard);
  const muzzle = spec?.muzzle ?? hazard.h * .7;
  playSfx('throw');
  // `aim` (LND-ENGINE E2 — cung thủ tháp canh, thuyền): bay thẳng tới tâm thân người chơi.
  const aim = hazard.aim ? { x: player.x + player.w / 2, y: player.y + player.h / 2 } : null;
  state.projectiles.push(makeProjectile(
    hazard.projectile,
    originX + direction * (spec?.muzzleX ?? hazard.w / 2 + 4),
    hazard.baseY - muzzle,
    direction,
    aim
  ));
}

// Bắt đầu hành động của lính: 'throw' (ném) hoặc 'alarm' (thổi tù và).
function startAction(hazard, name) {
  hazard.action = { name, time: 0, released: false };
}

// Chạy tiếp hành động đang diễn. `throw`: đạn rời tay đúng lúc animation tới ô
// hit_frame của manifest (trải trên `durations.throw` nếu có), hết animation
// thì về đứng yên và bắt đầu đếm lại fireInterval. `alarm` kéo dài alarmTime.
// Thiếu manifest -> ném ngay (như bản cũ không có animation).
function advanceAction(hazard, dt) {
  const action = hazard.action;
  action.time += dt;
  // Báo động (tù và) / phát tín hiệu gọi viện (E4): chỉ phát animation `<tên>Time` giây.
  if (action.name === 'alarm' || action.name === 'signal') {
    if (action.time >= (spriteOf(hazard)?.[`${action.name}Time`] ?? 0)) hazard.action = null;
    return;
  }
  const { meta, duration } = hazardAnim(hazard, 'throw');
  const releaseAt = meta ? hitTime(meta, duration) : 0;
  const total = meta ? animLength(meta, duration) : 0;
  if (!action.released && action.time >= releaseAt) {
    action.released = true;
    fireProjectile(hazard);
  }
  if (action.time >= total) {
    hazard.fireTimer = hazard.fireInterval;
    hazard.action = null;
  }
}

// Trạng thái animation của hazard: death > hurt > hành động (ném/báo động) >
// bẫy đã bật > di chuyển/đứng. Hành động dùng đúng đồng hồ của action để ô vẽ
// khớp thời điểm nhả đạn kể cả khi vừa bị ngắt bởi `hurt`.
function updateHazardAnimation(hazard, dt) {
  const anims = spriteOf(hazard)?.anims || {};
  let next;
  if (hazard.dying) next = 'death';
  else if (hazard.hitTimer > 0 && anims.hurt) next = 'hurt';
  else if (hazard.action && anims[hazard.action.name]) next = hazard.action.name;
  else if (hazard.sprung) next = 'sprung';
  else if (hazard.kind === 'vent') next = hazard.ventState === 'off' ? 'idle' : hazard.ventState;
  else if (hazard.kind === 'snare') next = hazard.snareState;
  else if (hazard.kind === 'drift') next = 'move';
  else if (hazard.kind === 'lurker') next = hazard.lurkState;
  else if (hazard.kind === 'patrol') next = hazard.walking ? 'move' : 'idle';
  else next = hazard.kind === 'roller' && hazard.active ? 'move' : 'idle';
  setAnim(hazard, next);
  tickAnim(hazard, dt);
  // Asset không có `idle` riêng (vd. kiệu quan): đứng ở ô 1 của strip thay vì chạy chân.
  if (next === 'idle' && spriteOf(hazard)?.idleHold) hazard.anim.time = 0;
  if (hazard.action && next === hazard.action.name) hazard.anim.time = hazard.action.time;
}

// Hazard đang chết: phát nốt death; xong thì xoá (hoặc nằm lại nếu `corpse`).
function updateDyingHazard(hazard, dt) {
  updateHazardAnimation(hazard, dt);
  if (spriteOf(hazard)?.corpse) return;
  const { meta } = hazardAnim(hazard, 'death');
  if (!meta || hazard.anim.time >= animLength(meta)) hazard.dying = false;
}

// Vùng phun theo nhịp (kind `vent`): `phase` = giây lệch nhịp ban đầu (nhiều
// miệng phun không đồng bộ). Chu kỳ `cycle` { off, warn, active } (giây) của
// sprite; harmful chỉ khi active.
function updateVent(hazard, dt) {
  const { off, warn, active } = spriteOf(hazard).cycle;
  hazard.phase += dt;
  const t = hazard.phase % (off + warn + active);
  hazard.ventState = t < off ? 'off' : t < off + warn ? 'warn' : 'active';
  hazard.harmful = hazard.ventState === 'active';
}

// Bẫy rơi (kind `snare`): `idle` treo trên cây, công tắc ẩn rộng triggerWidth
// quanh tâm trên mặt đất (chân người chơi chạm đất trong vùng) -> `warn` trong
// `warnTime` giây (springMessage), vật rung BÁM theo đầu người chơi -> `fall`
// thẳng xuống, vận tốc đầu `fallSpeed` + GRAVITY (đi bộ vẫn bị chụp, lướt thì
// thoát — LND-ENGINE Q3); lúc rơi chạm người chơi (lướt miễn như hazard thường)
// thì −`damage` máu + choáng `stun` giây, 1 lần; tới mặt đất -> `landed`, nằm lại vô hại.
function updateSnare(hazard, dt, player) {
  const spec = spriteOf(hazard);
  if (hazard.snareState === 'idle') {
    const center = hazard.x + hazard.w / 2;
    const playerCenter = player.x + player.w / 2;
    const onFloor = player.y + player.h >= hazard.floorY - GROUND_SNAP_DISTANCE;
    if (onFloor && Math.abs(playerCenter - center) <= hazard.triggerWidth / 2 + player.w / 2) {
      hazard.snareState = 'warn';
      hazard.snareTimer = spec?.warnTime ?? .35;
      playSfx('trap');
      if (spec?.springMessage) showMessage(spec.springMessage);
    }
    return;
  }
  if (hazard.snareState === 'warn') {
    hazard.x = player.x + player.w / 2 - hazard.w / 2;
    hazard.snareTimer -= dt;
    if (hazard.snareTimer <= 0) {
      hazard.snareState = 'fall';
      hazard.harmful = true;
      hazard.vy = spec?.fallSpeed ?? 300;
    }
    return;
  }
  if (hazard.snareState !== 'fall') return;
  hazard.vy += GRAVITY * dt;
  hazard.baseY = Math.min(hazard.floorY, hazard.baseY + hazard.vy * dt);
  hazard.y = hazard.baseY - hazard.h;
  if (hazard.harmful && !playerImmune(player) && aabb(player, hazard)) {
    hazard.harmful = false;
    const message = spec?.hitMessage || CHAPTER.text.hazardHit;
    hurtPlayer(message, spec?.damage ?? 1);
    if (!state.won) stunPlayer(message, spec?.stun ?? 1);
  }
  if (hazard.baseY >= hazard.floorY) {
    hazard.snareState = 'landed';
    hazard.harmful = false;
  }
}

// Khói trôi (kind `drift` — TQP-ENGINE E2): `wait` (ẩn) tới khi người chơi
// trong `triggerRange` quanh điểm xuất phát -> `move`: trôi theo `speed` (gây
// sát thương — lướt miễn như hazard thường) hết quãng `travel` -> `gap`: ẩn
// `gap` giây rồi về điểm xuất phát, xuất phát lại nếu người chơi còn trong tầm.
function updateDrift(hazard, dt, playerCenter) {
  const near = Math.abs(playerCenter - (hazard.originX + hazard.w / 2)) <= hazard.triggerRange;
  if (hazard.driftState === 'gap') {
    hazard.lurkTimer -= dt;
    if (hazard.lurkTimer > 0) return;
    hazard.x = hazard.originX;
    hazard.traveled = 0;
    hazard.driftState = 'wait';
  }
  if (hazard.driftState === 'wait') {
    if (!near) return;
    hazard.driftState = 'move';
    hazard.anim.time = 0;
  }
  const step = hazard.speed * dt;
  hazard.x += step;
  hazard.traveled += Math.abs(step);
  hazard.harmful = true;
  hazard.invisible = false;
  if (hazard.traveled >= hazard.travel) {
    hazard.driftState = 'gap';
    hazard.lurkTimer = hazard.gap;
    hazard.harmful = false;
    hazard.invisible = true;
  }
}

// Vật ngoi từ khe nước (kind `lurker` — TQP-ENGINE E3): `hidden` (dưới nước,
// không vẽ, vô hại, không chém được) -> người chơi trong `triggerRange` + hết
// nghỉ -> `warn` (bọt, `warnTime`) -> `attack` (ngoi đớp `upTime` giây: gây sát
// thương, chém được) -> `dive` (`diveTime`) -> `hidden`, nghỉ `rest` giây.
function updateLurker(hazard, dt, playerCenter) {
  const spec = spriteOf(hazard) || {};
  hazard.lurkTimer -= dt;
  // Lúc đớp chồm lên theo nửa sóng sin, cao nhất `leap` px (sprite) giữa `upTime`.
  const upTime = spec.upTime ?? 1;
  hazard.lift = hazard.lurkState === 'attack'
    ? (spec.leap ?? 0) * Math.sin(Math.PI * Math.min(1, Math.max(0, 1 - hazard.lurkTimer / upTime)))
    : 0;
  hazard.y = hazard.baseY - hazard.lift - hazard.h;
  if (hazard.lurkState === 'hidden') {
    hazard.restTimer = Math.max(0, hazard.restTimer - dt);
    const near = Math.abs(playerCenter - (hazard.x + hazard.w / 2)) <= hazard.triggerRange;
    if (!near || hazard.restTimer > 0) return;
    hazard.lurkState = 'warn';
    hazard.lurkTimer = spec.warnTime ?? .6;
    hazard.invisible = false;
  } else if (hazard.lurkState === 'warn' && hazard.lurkTimer <= 0) {
    hazard.lurkState = 'attack';
    hazard.lurkTimer = spec.upTime ?? 1;
    hazard.harmful = true;
    hazard.exposed = true;
    playSfx('trap');
  } else if (hazard.lurkState === 'attack' && hazard.lurkTimer <= 0) {
    hazard.lurkState = 'dive';
    hazard.lurkTimer = spec.diveTime ?? .3;
    hazard.harmful = false;
    hazard.exposed = false;
  } else if (hazard.lurkState === 'dive' && hazard.lurkTimer <= 0) {
    hazard.lurkState = 'hidden';
    hazard.restTimer = hazard.rest;
    hazard.invisible = true;
    return;
  } else {
    return;
  }
  hazard.anim.time = 0;
}

// Gọi viện (tuỳ chọn `callHelp` — TQP-ENGINE E4): người chơi ở trong `range`
// LIÊN TỤC đủ `after` giây mà hazard còn sống -> phát tín hiệu (`signal`,
// tiếng báo động, `signalMessage`) và sinh lính ở các vị trí `spawnAt`. 1 lần.
function updateCallHelp(hazard, dt, playerCenter) {
  const help = hazard.callHelp;
  if (!help || hazard.helpCalled) return;
  const near = Math.abs(playerCenter - (hazard.x + hazard.w / 2)) <= help.range;
  hazard.helpTimer = near ? hazard.helpTimer + dt : 0;
  if (hazard.helpTimer < help.after) return;
  hazard.helpCalled = true;
  const spec = spriteOf(hazard);
  if (spec?.anims?.signal) startAction(hazard, 'signal');
  playSfx('alarm');
  if (spec?.signalMessage) showMessage(spec.signalMessage, 2600);
  const enemy = help.enemy || {};
  help.spawnAt.forEach(x => {
    const w = enemy.w ?? 22;
    const soldier = makeEnemy(x - w / 2, w, enemy.h ?? 34, enemy.hp ?? 2, false, { aggroRange: help.aggroRange });
    if (enemy.art) soldier.art = enemy.art;
    state.enemies.push(soldier);
  });
}

// Người chơi đang đứng trên lưng hazard `ride` (chân không thấp hơn mặt bục
// quá GROUND_SNAP_DISTANCE) -> không tính va chạm thân.
function ridingOn(hazard, player) {
  const ride = spriteOf(hazard)?.ride;
  return Boolean(ride) && player.y + player.h <= hazard.y + ride.top + GROUND_SNAP_DISTANCE;
}

// Bục gắn hazard (E7) đi theo hazard; `dx` = quãng dịch frame này — player.js
// chở người chơi đứng trên bục theo ở frame sau. Hazard đã mất thì bỏ bục.
function syncRidePlatforms() {
  state.platforms = state.platforms.filter(platform => {
    const hazard = platform.attached;
    if (!hazard) return true;
    if (!hazard.alive) return false;
    const ride = spriteOf(hazard).ride;
    const nextX = hazard.x + ride.inset;
    platform.dx = nextX - platform.x;
    platform.x = nextX;
    platform.y = hazard.y + ride.top;
    return true;
  });
}

// Mini-boss đi tuần (kind `patrol`): người chơi ngoài tầm fireRange và không
// đang ném -> đi qua lại trong [patrolMin, patrolMax], quay theo hướng đi;
// trong tầm hoặc đang ném -> đứng lại, quay về phía người chơi. Cú ném dùng
// chung cơ chế thrower trong updateHazards (đạn rời tay ở hit_frame, chu kỳ
// fireInterval tính từ lúc ném xong). Không bị đẩy lùi khi trúng đòn.
function updatePatrol(hazard, dt, playerCenter) {
  const center = hazard.x + hazard.w / 2;
  if (hazard.action || Math.abs(playerCenter - center) <= hazard.fireRange) {
    hazard.walking = false;
    hazard.facing = Math.sign(playerCenter - center) || -1;
    return;
  }
  hazard.walking = true;
  let direction = Math.sign(hazard.speed) || -1;
  if (center <= hazard.patrolMin) direction = 1;
  else if (center >= hazard.patrolMax) direction = -1;
  hazard.speed = direction * Math.abs(hazard.speed);
  hazard.facing = direction;
  hazard.x += hazard.speed * dt;
}

export function updateHazards(dt) {
  const player = state.player;
  const playerCenter = player.x + player.w / 2;

  state.hazards.forEach(hazard => {
    hazard.hitTimer = Math.max(0, hazard.hitTimer - dt);
    if (!hazard.alive) {
      if (hazard.dying) updateDyingHazard(hazard, dt);
      return;
    }

    if (hazard.kind === 'roller') {
      if (!hazard.active) {
        if (hazard.triggerX !== null && player.x >= hazard.triggerX) hazard.active = true;
        else return;
      }
      hazard.x += hazard.speed * dt;
      // Lăn/chạy theo bậc đất (TT-TERRAIN-01): đứng trên mặt đất tại tâm.
      if (hazard.grounded) hazard.baseY = groundYAt(hazard.x + hazard.w / 2);
      hazard.y = hazard.baseY - hazard.h;
      if (hazard.x + hazard.w < playerCenter - HAZARD_DESPAWN_MARGIN) {
        hazard.alive = false;
        // Xe chở sách lăn qua mà chưa bị phá: sách vẫn hiện để không kẹt màn (E4a).
        revealCarriedItems(hazard);
        return;
      }
    }

    if (hazard.kind === 'patrol') updatePatrol(hazard, dt, playerCenter);
    if (hazard.kind === 'vent') updateVent(hazard, dt);
    if (hazard.kind === 'drift') updateDrift(hazard, dt, playerCenter);
    if (hazard.kind === 'lurker') updateLurker(hazard, dt, playerCenter);
    updateCallHelp(hazard, dt, playerCenter);
    if (hazard.kind === 'snare') {
      updateSnare(hazard, dt, player);
      updateHazardAnimation(hazard, dt);
      return;
    }

    if (hazard.kind === 'trap' && !hazard.sprung) {
      if (Math.abs(playerCenter - (hazard.x + hazard.w / 2)) <= hazard.triggerDistance) {
        hazard.sprung = true;
        hazard.harmful = true;
        playSfx('trap');
        const message = spriteOf(hazard)?.springMessage;
        if (message) showMessage(message);
      }
    }

    const distance = Math.abs(playerCenter - (hazard.x + hazard.w / 2));

    // Lính gác thấy người chơi thì báo động, đánh thức roller đang chờ
    // (hazard có id = alarmFor) — báo động chỉ kêu một lần mỗi lượt chơi.
    if (hazard.alarmFor && !hazard.alarmed && distance <= hazard.fireRange) {
      hazard.alarmed = true;
      const summoned = state.hazards.find(item => item.id === hazard.alarmFor);
      if (summoned) summoned.active = true;
      const message = spriteOf(hazard)?.alarmMessage;
      if (message) showMessage(message, 2600);
      startAction(hazard, 'alarm');
      playSfx('alarm');
    }

    // Đang diễn hành động thì diễn cho hết (kể cả khi người chơi vừa ra khỏi
    // tầm) để cú ném không bị cắt ngang giữa chừng.
    if (hazard.action) {
      advanceAction(hazard, dt);
    } else if (hazard.projectile && distance <= hazard.fireRange && !playerHidden(player)) {
      // Người chơi đang ẩn trong lau sậy (TQP-ENGINE E7) thì không bắn.
      hazard.fireTimer -= dt;
      if (hazard.fireTimer <= 0) {
        startAction(hazard, 'throw');
        advanceAction(hazard, 0);
      }
    }

    updateHazardAnimation(hazard, dt);

    const spec = spriteOf(hazard);
    // `ignoreDash` (vent): lướt KHÔNG miễn sát thương, chỉ còn nhấp nháy sau khi trúng đòn.
    const immune = spec?.ignoreDash ? player.invulnerable > 0 : playerImmune(player);
    if (hazard.harmful && !immune && aabb(player, hazard) && !ridingOn(hazard, player)) {
      hurtPlayer((hazard.sprung && spec?.sprungMessage) || spec?.hitMessage || CHAPTER.text.hazardHit, spec?.damage ?? 1);
    }
  });

  // Xác (`corpse`) giữ dying = true mãi nên nằm lại map.
  state.hazards = state.hazards.filter(hazard => hazard.alive || hazard.dying);
  syncRidePlatforms();
}

export function updateProjectiles(dt) {
  const player = state.player;
  state.projectiles.forEach(projectile => {
    if (!projectile.alive) return;
    // Đạn nhắm (E2) bay theo vector (vx, vy); đạn ngang vx = ±1, vy = 0.
    const speed = CHAPTER.sprites.projectiles[projectile.sprite]?.speed ?? PROJECTILE_SPEED;
    projectile.x += projectile.vx * speed * dt;
    projectile.y += projectile.vy * speed * dt;
    projectile.traveled += speed * dt;
    projectile.age += dt;
    if (projectile.traveled >= PROJECTILE_MAX_RANGE
      || Math.abs(projectile.x - state.cameraX) > VIEW_W + HAZARD_DESPAWN_MARGIN
      || projectile.y + projectile.h < 0 || projectile.y > VIEW_H) {
      projectile.alive = false;
      return;
    }
    // Đập vào sườn bậc đất (TT-TERRAIN-01) thì tan. Trên khe hố/sông không có
    // đất (đạn của thuyền bắn từ dưới mặt nước lên — LND-ENGINE E2).
    const centerX = projectile.x + projectile.w / 2;
    const overHole = state.holes.some(hole => centerX > hole.x && centerX < hole.x + hole.w);
    if (!overHole && projectile.y + projectile.h / 2 > groundYAt(centerX)) {
      projectile.alive = false;
      return;
    }
    // Đang dash thì đạn bay xuyên qua (không tan, không trừ máu).
    if (!playerImmune(player) && aabb(player, projectile)) {
      projectile.alive = false;
      hurtPlayer(CHAPTER.text.projectileHit, CHAPTER.sprites.projectiles[projectile.sprite]?.damage ?? 1);
    }
  });
  state.projectiles = state.projectiles.filter(projectile => projectile.alive);
}
