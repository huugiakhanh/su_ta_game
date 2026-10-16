// Vẽ thực thể trong thế giới: cổng đích + cờ, bia câu hỏi, vật phẩm, vật cản
// tĩnh, hazard, đạn, quân địch, NPC. Bảng ánh xạ asset lấy từ CHAPTER.sprites.

import { images } from '../assets.js';
import { state, bossAlive, enemyArtKey } from '../state.js';
import { getAnimMeta, frameIndex } from '../animation.js';
import { VIEW_W, GROUND_Y, PROJECTILE_MAX_RANGE, PROJECTILE_FADE_RANGE, ITEM_BOB_AMPLITUDE } from '../config.js';
import { CHAPTER, LEVEL } from '../chapter.js';
import {
  ctx, debugLabels, drawMapImage, mapWidth, mapHeight, drawSprite, spriteImage, drawAnimated, drawPlaceholder,
  drawHealthBar, facingDirection
} from './canvas.js';

// Điều kiện thắng về NỘI DUNG đã đủ (boss/mini-boss đã hạ + nhặt hết vật phẩm)
// — cổng mở trước khi người chơi chạm finishX; trigger về đích ở level-flow.js.
function finishGateOpen() {
  // Đấu trường: cổng đóng suốt trận, chỉ mở trong cutscene (state.gateOpen).
  if (LEVEL.arena) return state.gateOpen;
  return !bossAlive() && state.itemsCollected >= state.items.length;
}

// Cổng đích: x1, pivot bottom-center (manifest map), đáy ở GROUND_Y.
// Màn không có cổng (LEVEL.gate = null) thì bỏ qua.
export function drawFinishGate(time = 0) {
  const gate = LEVEL.gate;
  if (!gate) return;
  const prop = images.maps.props[finishGateOpen() ? gate.open : gate.closed]
    || images.maps.props[gate.closed];
  const w = prop ? mapWidth(prop.image) : 131;
  const h = prop ? mapHeight(prop.image) : 150;
  const pivot = prop?.asset.pivot || { x: w / 2, y: h };
  const left = Math.round(gate.worldX - pivot.x - state.cameraX);
  if (left + w < -48 || left > VIEW_W + 48) return;
  const top = GROUND_Y - pivot.y;
  if (prop) drawMapImage(ctx, prop.image, 0, 0, w, h, left, top);
  else drawLandmarkFallback(left, top, w, h);
  if (state.gateOpen && gate.flag) drawVictoryFlag(gate.flag, prop, left, top, time);
}

// Cờ chiến thắng cắm trên cổng mở (cutscene): `flag` = { id, attach } của
// LEVEL.gate; pivot bottom-left đặt tại flag.attach (null thì dùng flag_attach
// của cổng mở trong manifest map), strip lặp theo fps manifest. Thiếu ảnh/điểm
// gắn -> bỏ (TODO_MISSING).
function drawVictoryFlag(flagSpec, gateProp, gateLeft, gateTop, time) {
  const flag = images.maps.props[flagSpec.id];
  const attach = flagSpec.attach || gateProp?.asset.flag_attach;
  if (!flag || !attach) return;
  const { frame_w: fw, frame_h: fh, frames = 1, fps = 6, pivot = { x: 0, y: fh } } = flag.asset;
  const frame = Math.floor(time * fps) % frames;
  drawMapImage(ctx, flag.image, frame * fw, 0, fw, fh, gateLeft + attach.x - pivot.x, gateTop + attach.y - pivot.y);
}

// Bia đá đánh dấu mốc câu hỏi (TT-QUIZ-01): x1, pivot bottom-center tại
// `quiz.x`, đáy ở GROUND_Y. Chưa hỏi -> strip `active` lặp theo fps manifest
// map; đã hỏi (`quiz.done`) -> ảnh `done`. Thiếu ảnh thì bỏ.
export function drawQuizSteles(time) {
  const stele = images.maps.props[CHAPTER.quizStele];
  if (!stele) return;
  const { frame_w: fw, frame_h: fh, frames = 1, fps = 6, pivot = { x: fw / 2, y: fh } } = stele.asset;
  state.quizzes.forEach(quiz => {
    const left = Math.round(quiz.x - pivot.x - state.cameraX);
    if (left + fw < 0 || left > VIEW_W) return;
    const top = (quiz.footY ?? GROUND_Y) - pivot.y;
    const done = quiz.done && stele.states.done;
    const image = done ? stele.states.done : (stele.states.active || stele.image);
    const frame = done ? 0 : Math.floor(time * fps) % frames;
    drawMapImage(ctx, image, frame * fw, 0, fw, fh, left, top);
  });
}

// Cổng gỗ tạm (2 cột + xà ngang + cờ nhỏ) — chỉ dùng khi thiếu ảnh cổng.
function drawLandmarkFallback(left, top, w, h) {
  const x = Math.round(left);
  const y = Math.round(top);
  const postW = Math.max(5, Math.round(w * 0.09));
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x, y, postW, h);
  ctx.fillRect(Math.round(x + w - postW), y, postW, h);
  ctx.fillStyle = '#7a4f2c';
  ctx.fillRect(x - 2, y, Math.round(w) + 5, 11);
  ctx.fillStyle = '#b23325';
  ctx.beginPath();
  ctx.moveTo(x + w - postW, y + 11);
  ctx.lineTo(x + w - postW + 18, y + 16);
  ctx.lineTo(x + w - postW, y + 22);
  ctx.closePath();
  ctx.fill();
}

// Vật phẩm thu thập: strip CHAPTER.item.sprite x1, tâm tại (item.x, item.y +
// bob), lặp CHAPTER.item.fps; bob làm tròn về pixel nguyên. Không quầng sáng (G5).
export function drawItems(time) {
  const prop = images.maps.props[CHAPTER.item?.sprite];
  state.items.forEach((item, index) => {
    if (item.collected) return;
    const x = Math.round(item.x - state.cameraX);
    if (x < -36 || x > VIEW_W + 36) return;
    const y = Math.round(item.y) + Math.round(Math.sin(time * 4 + index) * ITEM_BOB_AMPLITUDE);
    if (!prop) {
      ctx.fillStyle = '#f4d05c';
      ctx.fillRect(x - 8, y - 8, 16, 16);
      return;
    }
    const { frame_w: fw = mapWidth(prop.image), frame_h: fh = mapHeight(prop.image), frames = 1 } = prop.asset;
    const frame = Math.floor(time * CHAPTER.item.fps + index) % frames;
    drawMapImage(ctx, prop.image, frame * fw, 0, fw, fh, x - fw / 2, y - fh / 2);
  });
}

// Toạ độ world (trái, trên) để vẽ ảnh vật cản x1 sao cho PHẦN NHÌN THẤY trùng
// hitbox: có `visible_bbox` -> góc bbox trùng góc hitbox; không có -> đáy-giữa
// canvas trùng đáy-giữa hitbox, chìm thêm groundSink px.
export function obstacleDrawRect(obstacle, asset) {
  const bbox = asset.visible_bbox;
  if (bbox) return { x: obstacle.x - bbox.x, y: obstacle.y - bbox.y };
  return {
    x: Math.round(obstacle.x + obstacle.w / 2 - asset.w / 2),
    y: obstacle.y + obstacle.h + obstacle.groundSink - asset.h
  };
}

// Vật cản tĩnh: ảnh theo cỡ logic (không co giãn, không quầng — G5). Thiếu ảnh thì
// vẽ hộp tạm đúng hitbox.
export function drawObstacles() {
  state.obstacles.forEach(obstacle => {
    if (!obstacle.active) return;
    const prop = images.maps.props[CHAPTER.sprites.obstacles[obstacle.type]?.id];
    debugLabels.set(obstacle, obstacle.type);
    if (!prop) {
      if (obstacle.x - state.cameraX + obstacle.w < -48 || obstacle.x - state.cameraX > VIEW_W + 48) return;
      drawPlaceholder(obstacle);
      return;
    }
    const asset = prop.asset;
    // Asset nhiều ô trạng thái (cột đá: intact/cracked — `frame_states`): vẽ ô
    // theo obstacle.state, đáy-giữa ô trùng đáy-giữa hitbox. `alpha` = mờ dần
    // khi cột vỡ (Phase B).
    if (asset.frame_w && asset.frames > 1) {
      const frame = Math.max(0, asset.frame_states?.indexOf(obstacle.state) ?? 0);
      const left = Math.round(obstacle.x + obstacle.w / 2 - asset.frame_w / 2 - state.cameraX);
      if (left + asset.frame_w < -48 || left > VIEW_W + 48) return;
      const top = Math.round(obstacle.y + obstacle.h + obstacle.groundSink - asset.frame_h);
      ctx.globalAlpha = obstacle.alpha ?? 1;
      drawMapImage(ctx, prop.image, frame * asset.frame_w, 0, asset.frame_w, asset.frame_h, left, top);
      ctx.globalAlpha = 1;
      debugLabels.set(obstacle, `${obstacle.type} ${obstacle.state || ''}`);
      return;
    }
    const rect = obstacleDrawRect(obstacle, asset);
    const left = Math.round(rect.x - state.cameraX);
    const w = mapWidth(prop.image);
    if (left + w < -48 || left > VIEW_W + 48) return;
    drawMapImage(ctx, prop.image, 0, 0, w, mapHeight(prop.image), left, Math.round(rect.y));
  });
}

// Vật có trạng thái (sprite, pivot bottom-center = tâm ngang + chân
// hitbox). Chia làm 2 lượt vẽ theo `grounded`:
//   submerged (thuyền, grounded = false) vẽ TRƯỚC drawHoles() để thân thuyền
//     chìm dưới lớp tối của khe sông.
//   còn lại vẽ sau vật cản, trước enemy.
// Hazard đang chết (dying) vẫn vẽ để phát nốt death/break; xác xe nằm lại.
export function drawHazards(time, submerged = false) {
  state.hazards.forEach(hazard => {
    if (!hazard.alive && !hazard.dying) return;
    if (hazard.grounded === submerged) return;
    // Roller chưa được kích hoạt thì chưa xuất hiện trên màn — nó đang "chờ"
    // ngoài tầm nhìn, vẽ ra sẽ thành vật đứng im giữa đường.
    if (hazard.kind === 'roller' && !hazard.active) return;
    const sprite = CHAPTER.sprites.hazards[hazard.sprite];
    const centerX = hazard.x + hazard.w / 2;
    const pivotX = Math.round(centerX - state.cameraX);
    if (pivotX < -80 || pivotX > VIEW_W + 80) return;
    const footY = Math.round(hazard.baseY + (sprite?.sink || 0));
    const facing = facingDirection(centerX, hazard.facing, hazard.kind === 'thrower');
    const drawn = sprite && drawAnimated(sprite.id, sprite.anims, sprite.durations, hazard, pivotX, footY, facing);
    if (!drawn) {
      drawPlaceholder(hazard);
      debugLabels.set(hazard, `${hazard.sprite} (placeholder)`);
      return;
    }
    debugLabels.set(hazard, drawn.label);
    if (hazard.alive && hazard.maxHp > 0 && hazard.hp > 0) {
      const barW = hazard.w + 8;
      drawHealthBar(pivotX - barW / 2, drawn.top - 5, barW, hazard.hp / hazard.maxHp, hazard.boss ? '#e34c36' : '#e2ad45');
    }
  });
}

export function drawProjectiles() {
  state.projectiles.forEach(projectile => {
    const art = CHAPTER.sprites.projectiles[projectile.sprite];
    const centerX = Math.round(projectile.x + projectile.w / 2 - state.cameraX);
    const centerY = Math.round(projectile.y + projectile.h / 2);
    if (centerX < -40 || centerX > VIEW_W + 40) return;
    // Đoạn cuối tầm bay mờ dần để đạn không biến mất đột ngột.
    const alpha = Math.max(0, Math.min(1, (PROJECTILE_MAX_RANGE - projectile.traveled) / PROJECTILE_FADE_RANGE));
    const meta = art ? getAnimMeta(art.id, art.anim) : null;
    const image = art ? spriteImage(art.id, art.anim) : null;
    if (!meta || !image) {
      drawPlaceholder(projectile, alpha);
      return;
    }
    // Strip đạn lặp theo tuổi của viên đạn (đồng hồ riêng); tâm ô vẽ trùng
    // tâm hitbox; ảnh gốc quay PHẢI nên bay sang trái thì lật.
    const frame = frameIndex(meta, projectile.age);
    const footY = centerY - Math.round(meta.frame_h / 2) + meta.frame_h - 1;
    drawSprite(image, meta, frame, centerX, footY, projectile.direction < 0 ? -1 : 1, alpha);
    debugLabels.set(projectile, `${art.anim} ${frame + 1}/${meta.frames}`);
  });
}

// Lính canh / boss đứng yên (sprite, pivot = tâm ngang + chân hitbox).
// Boss không có animation `hurt` nên trúng đòn thì nháy mờ như bản cũ.
export function drawEnemies() {
  state.enemies.forEach(enemy => {
    if (!enemy.alive && !enemy.dying) return;
    const art = CHAPTER.sprites.enemies[enemyArtKey(enemy)];
    const kind = CHAPTER.enemyKinds?.[enemy.kind];
    const centerX = enemy.x + enemy.w / 2;
    const pivotX = Math.round(centerX - state.cameraX);
    if (pivotX < -80 || pivotX > VIEW_W + 80) return;
    const footY = Math.round(enemy.y + enemy.h);
    const alpha = enemy.hitTimer > 0 && !art.anims.hurt && enemy.alive ? .45 : 1;
    // Rung ngang do chương quyết định (vd. chiến xa đứng báo trước khi lao).
    const shake = kind?.shake?.(enemy) || 0;
    // Lính thường có hướng riêng (`facing`, theo hướng đi/về phía người chơi);
    // boss không có -> luôn quay về phía người chơi.
    const drawn = drawAnimated(art.id, art.anims, null, enemy, pivotX + shake, footY, facingDirection(centerX, enemy.facing || 0, true), alpha);
    if (!drawn) {
      // Bao cát (layout thử) không có asset: hộp tạm + thanh máu + số máu.
      drawPlaceholder(enemy, alpha);
      debugLabels.set(enemy, `${enemyArtKey(enemy)} hp ${enemy.hp}`);
      if (enemy.harmless && enemy.alive) drawHealthBar(pivotX - (enemy.w + 8) / 2, enemy.y - 6, enemy.w + 8, enemy.hp / enemy.maxHp, '#e2ad45');
      return;
    }
    debugLabels.set(enemy, kind?.debugLabel ? kind.debugLabel(enemy, drawn.label) : drawn.label);
    if (enemy.alive && !enemy.noBar) {
      const barW = enemy.w + 8;
      drawHealthBar(pivotX - barW / 2, drawn.top - 5, barW, enemy.hp / enemy.maxHp, enemy.boss ? '#e34c36' : '#e2ad45');
    }
  });
}

// NPC: sprite theo cỡ logic, pivot bottom-center tại (centerX, mặt đất = npc.y + npc.h),
// quay về phía người chơi. `idle`, hoặc `talk` khi đang nói thoại — cả hai
// lặp theo đồng hồ chung `time` (game tạm dừng lúc hội thoại nên không dùng
// đồng hồ riêng tick trong mô phỏng). Gặp xong thì mờ dần theo npc.fade.
export function drawNpcs(time) {
  // + NPC dẫn đầu màn (state.guide — TT-HERO-01), vẽ như NPC.
  [...state.npcs, state.guide].filter(Boolean).forEach(npc => {
    if (npc.fade <= 0) return;
    const sprite = CHAPTER.sprites.npcs[npc.id];
    const pivotX = Math.round(npc.centerX - state.cameraX);
    if (pivotX < -60 || pivotX > VIEW_W + 60) return;
    const pose = { anim: { name: npc.talking ? 'talk' : 'idle', time } };
    const drawn = sprite && drawAnimated(sprite.id, sprite.anims, null, pose, pivotX, npc.y + npc.h, facingDirection(npc.centerX, 0, true), npc.fade);
    if (!drawn) {
      drawPlaceholder(npc, npc.fade);
      debugLabels.set(npc, `${npc.id} (placeholder)`);
      return;
    }
    debugLabels.set(npc, `${npc.id} ${drawn.label}`);
  });
}
