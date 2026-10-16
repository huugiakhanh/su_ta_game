// Lớp vẽ riêng chương Trưng Trắc (màn 3) — gắn vào engine qua
// CHAPTER.hooks.draw: Tô Định đứng sau xác xe (trước quân), hũ dầu + bóng
// Trưng Nhị (trước người chơi), lửa dầu + mưa tên (sau người chơi).

import { state } from '../../engine/state.js';
import { getAnimMeta, frameIndex } from '../../engine/animation.js';
import { VIEW_W, GROUND_Y, ATTACK_COOLDOWN } from '../../engine/config.js';
import {
  ctx, debugLabels, drawSprite, drawTintedSprite, drawAnimated, drawPlaceholder, spriteImage, facingDirection
} from '../../engine/render/canvas.js';
import { BOSS_TD, SKILLS, ARROW_RAIN_SPRITE, ENEMY_SPRITES } from './config.js';

// ---- Boss (TT-BOSS-01 §3.5–3.6) ----
// Tô Định đi bộ đứng sau xác xe (giai đoạn 2) — vẽ TRƯỚC enemy để nằm sau xe.
function drawBossFoot() {
  const foot = state.battle?.foot;
  if (!foot) return;
  const art = ENEMY_SPRITES.bossFoot;
  const pivotX = Math.round(foot.x - state.cameraX);
  const drawn = drawAnimated(art.id, art.anims, null, foot, pivotX, GROUND_Y, facingDirection(foot.x, 0, true));
  if (!drawn) drawPlaceholder({ x: foot.x - 11, y: GROUND_Y - 40, w: 22, h: 40 });
}

// Hũ dầu (PJ_OIL_JAR `loop`, lặp theo tuổi hũ), tâm ô trùng tâm hitbox.
function drawJars() {
  const jarArt = BOSS_TD.jar;
  const meta = getAnimMeta(jarArt.id, jarArt.anim);
  const image = spriteImage(jarArt.id, jarArt.anim);
  state.jars.forEach(jar => {
    const centerX = Math.round(jar.x - state.cameraX);
    const centerY = Math.round(jar.y);
    if (!meta || !image) {
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
      return;
    }
    const footY = centerY - Math.round(meta.frame_h / 2) + meta.frame_h - 1;
    drawSprite(image, meta, frameIndex(meta, jar.age), centerX, footY, jar.vx < 0 ? -1 : 1);
    debugLabels.set(jar, jar.reflected ? 'hũ phản' : 'hũ');
  });
}

// Lửa dầu (FX_OIL_FIRE `impact`, không lặp -> giữ ô cuối tới hết fire.time).
function drawFires() {
  const fireArt = BOSS_TD.fire;
  const meta = getAnimMeta(fireArt.id, fireArt.anim);
  const image = spriteImage(fireArt.id, fireArt.anim);
  state.fires.forEach(fire => {
    const pivotX = Math.round(fire.x - state.cameraX);
    if (!meta || !image) {
      ctx.fillStyle = 'rgba(240, 120, 30, .7)';
      ctx.fillRect(pivotX - fireArt.width / 2, fire.footY - fireArt.h, fireArt.width, fireArt.h);
      return;
    }
    drawSprite(image, meta, frameIndex(meta, fire.time), pivotX, Math.round(fire.footY), 1);
  });
}

// ---- Kỹ năng (TT-BOSS-01 §3.2) ----
const SHADOW = SKILLS.SK_TRUNG_NHI_SHADOW;
const SHADOW_ANIMS = { idle: 'idle', run: 'run', attack: 'attack_01' };

// Bóng Trưng Nhị: NPC_TRUNG_NHI alpha .5 ánh chàm, vẽ SAU lưng người chơi
// (trước drawPlayer). Chém: attack_01 trải trên ATTACK_COOLDOWN như người chơi.
function drawShadow() {
  const shadow = state.skills?.shadow;
  const pose = shadow?.pose;
  if (!pose || shadow.active <= 0) return;
  const key = shadow.anim?.name || 'idle';
  const name = SHADOW_ANIMS[key] || 'idle';
  const meta = getAnimMeta(SHADOW.sprite, name);
  const image = spriteImage(SHADOW.sprite, name);
  const pivotX = Math.round(pose.x + pose.w / 2 - state.cameraX);
  const footY = Math.round(pose.y + pose.h);
  if (!meta || !image) {
    drawPlaceholder(pose, SHADOW.alpha);
    return;
  }
  const frame = frameIndex(meta, shadow.anim.time, key === 'attack' ? ATTACK_COOLDOWN : null);
  drawTintedSprite(image, meta, frame, pivotX, footY, pose.facing < 0 ? -1 : 1, SHADOW.alpha, SHADOW.tint);
  debugLabels.set(pose, `bóng ${name} ${frame + 1}/${meta.frames}`);
}

// Mưa tên trên thành: vạch báo nhấp nháy trên mặt đất (vẽ bằng code) trong lúc
// báo trước và lúc tên đang rơi.
function drawWallArrowMarks(time) {
  state.wallArrows.forEach(arrow => {
    const x = Math.round(arrow.x - state.cameraX);
    if (x < -16 || x > VIEW_W + 16) return;
    const blink = arrow.warn > 0 && Math.floor(time * 10) % 2 === 0;
    ctx.fillStyle = blink ? 'rgba(255, 230, 120, .9)' : 'rgba(210, 40, 30, .85)';
    ctx.fillRect(x - 7, GROUND_Y - 1, 14, 2);
    ctx.fillRect(x - 1, GROUND_Y - 4, 2, 3);
  });
}

// Mưa tên (kỹ năng) + tên trên thành: PJ_ARROW_RAIN (mũi ở đáy ô) vẽ x1 tại (centerX, tipY).
function drawArrows() {
  const meta = getAnimMeta(ARROW_RAIN_SPRITE.id, ARROW_RAIN_SPRITE.anim);
  const image = spriteImage(ARROW_RAIN_SPRITE.id, ARROW_RAIN_SPRITE.anim);
  const falling = [
    ...state.arrows.filter(arrow => arrow.delay <= 0),
    ...state.wallArrows.filter(arrow => arrow.warn <= 0).map(arrow => ({ centerX: arrow.x, tipY: arrow.tipY }))
  ];
  falling.forEach(arrow => {
    const pivotX = Math.round(arrow.centerX - state.cameraX);
    if (pivotX < -16 || pivotX > VIEW_W + 16) return;
    const tipY = Math.round(arrow.tipY);
    if (meta && image) drawSprite(image, meta, 0, pivotX, tipY, 1);
    else {
      ctx.fillStyle = '#e8d9a8';
      ctx.fillRect(pivotX - 1, tipY - 18, 2, 18);
    }
  });
}

// Thứ tự vẽ (CHAPTER.hooks.draw).
export const DRAW_LAYERS = {
  beforeEnemies: () => drawBossFoot(),
  beforePlayer: () => {
    drawJars();
    drawShadow();
  },
  afterPlayer: time => {
    drawFires();
    drawWallArrowMarks(time);
    drawArrows();
  }
};
