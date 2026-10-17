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
// Hazard có `ride` (sprite) mang một bục một chiều trên lưng (E7 — voi rừng):
// bục đi theo hazard; người chơi đứng trên lưng thì không bị va chạm thân.
// Hazard đang chết (dying) chỉ phát nốt animation, không va chạm/di chuyển.

import { state } from './state.js';
import { showMessage } from './ui.js';
import { aabb, groundYAt, makeProjectile } from './geometry.js';
import { setAnim, tickAnim, getAnimMeta, hitTime, animLength } from './animation.js';
import { VIEW_W, PROJECTILE_SPEED, PROJECTILE_MAX_RANGE, HAZARD_DESPAWN_MARGIN, GROUND_SNAP_DISTANCE } from './config.js';
import { CHAPTER } from './chapter.js';
import { playSfx } from './audio.js';
import { hurtPlayer, playerImmune } from './damage.js';

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
  state.projectiles.push(makeProjectile(
    hazard.projectile,
    originX + direction * (spec?.muzzleX ?? hazard.w / 2 + 4),
    hazard.baseY - muzzle,
    direction
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
  if (action.name === 'alarm') {
    if (action.time >= (spriteOf(hazard)?.alarmTime ?? 0)) hazard.action = null;
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
        return;
      }
    }

    if (hazard.kind === 'patrol') updatePatrol(hazard, dt, playerCenter);
    if (hazard.kind === 'vent') updateVent(hazard, dt);

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
    } else if (hazard.projectile && distance <= hazard.fireRange) {
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
    projectile.x += projectile.direction * PROJECTILE_SPEED * dt;
    projectile.traveled += PROJECTILE_SPEED * dt;
    projectile.age += dt;
    if (projectile.traveled >= PROJECTILE_MAX_RANGE
      || Math.abs(projectile.x - state.cameraX) > VIEW_W + HAZARD_DESPAWN_MARGIN) {
      projectile.alive = false;
      return;
    }
    // Đập vào sườn bậc đất (TT-TERRAIN-01) thì tan.
    if (projectile.y + projectile.h / 2 > groundYAt(projectile.x + projectile.w / 2)) {
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
