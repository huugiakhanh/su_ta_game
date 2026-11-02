// Lớp vẽ riêng chương Lý Nam Đế (màn 3, LND-L3) — gắn vào engine qua
// CHAPTER.hooks.draw: máy bắn đá + Tiêu Tư trên mặt thành/đang rơi (trước quân);
// đá, tiền vàng (trước người chơi); Khiên Tô Lịch, vòng choáng, tóe lửa khiên,
// vạch báo đá, sóng Triều Cường, Lý Bí + cờ cutscene (sau người chơi).
// Không có gì để vẽ thì thoát trước khi tra ảnh (màn 1–2 không nạp sprite màn 3).

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { getAnimMeta, frameIndex } from '../../engine/animation.js';
import { VIEW_W, GROUND_Y } from '../../engine/config.js';
import { ctx, debugLabels, drawSprite, drawMapImage, spriteImage, facingDirection } from '../../engine/render/canvas.js';
import { BOSS_TT, CATAPULT, SHIELD_GUARD, GOLD_COIN, STUN_FX, SKILLS, LND_CUTSCENE } from './config.js';
import { WALL_Y } from './boss.js';

const screenX = worldX => Math.round(worldX - state.cameraX);

// Ô hiện tại của entity `{ anim }` theo sprite `id`; thiếu ảnh thì false.
function drawAnim(id, entity, pivotWorldX, footY, facing, alpha = 1) {
  const name = entity.anim?.name;
  const meta = name ? getAnimMeta(id, name) : null;
  const image = name ? spriteImage(id, name) : null;
  if (!meta || !image) return false;
  const frame = frameIndex(meta, entity.anim.time);
  drawSprite(image, meta, frame, screenX(pivotWorldX), Math.round(footY), facing, alpha);
  debugLabels.set(entity, `${id} ${name} ${frame + 1}/${meta.frames}`);
  return true;
}

// ---- Trên mặt thành ----
// Máy bắn đá (quay về phía bắn) + Tiêu Tư đứng chỉ huy (quay về người chơi) hoặc
// đang rơi xuống (GĐ 3).
function drawWall() {
  const battle = state.battle;
  // Chưa nạp xong nền thành thì chưa vẽ (không để máy bắn đá lơ lửng giữa trời).
  if (!battle?.catapult || !images.loaded) return;
  if (!drawAnim(CATAPULT.id, battle.catapult, CATAPULT.x, WALL_Y, battle.catapult.facing || -1)) {
    ctx.fillStyle = '#7a5a2a';
    ctx.fillRect(screenX(CATAPULT.x) - 30, WALL_Y - 24, 60, 24);
  }
  const commander = battle.commander;
  if (commander) drawAnim(BOSS_TT.id, commander, BOSS_TT.wallX, WALL_Y, facingDirection(BOSS_TT.wallX, 0, true));
  const drop = battle.drop;
  if (drop) drawAnim(BOSS_TT.id, drop, drop.x, GROUND_Y - Math.max(0, drop.height), facingDirection(drop.x, 0, true));
}

// Đá OB_BOULDER (`roll` khi bay, `break` khi vỡ), tâm hình cao `radius` trên chân ô.
function drawBoulders() {
  const boulders = state.battle?.boulders || [];
  boulders.forEach(boulder => {
    if (!drawAnim(CATAPULT.boulder, boulder, boulder.x, boulder.y + CATAPULT.radius, boulder.vx < 0 ? -1 : 1)) {
      ctx.fillStyle = '#7d7468';
      ctx.fillRect(screenX(boulder.x) - 8, Math.round(boulder.y) - 8, 16, 16);
    }
  });
}

// Vạch báo chỗ đá rơi: nhấp nháy trên đất tới khi đá chạm đất.
function drawBoulderWarnings(time) {
  const boulders = state.battle?.boulders || [];
  boulders.filter(boulder => !boulder.broken).forEach(boulder => {
    const x = screenX(boulder.targetX);
    if (x < -16 || x > VIEW_W + 16) return;
    ctx.fillStyle = Math.floor(time * 10) % 2 === 0 ? 'rgba(240, 200, 80, .9)' : 'rgba(210, 40, 30, .85)';
    ctx.fillRect(x - 9, GROUND_Y - 1, 18, 2);
    ctx.fillRect(x - 1, GROUND_Y - 4, 2, 3);
  });
}

// Tiền vàng (PJ_BT_GOLD_COIN `loop`, xoay theo tuổi), tâm ô trùng tâm hitbox.
function drawCoins() {
  const coins = state.battle?.coins || [];
  if (!coins.length) return;
  const meta = getAnimMeta(GOLD_COIN.id, GOLD_COIN.anim);
  const image = spriteImage(GOLD_COIN.id, GOLD_COIN.anim);
  coins.forEach(coin => {
    const centerX = screenX(coin.x);
    const centerY = Math.round(coin.y);
    if (!meta || !image) {
      ctx.fillStyle = '#e8b030';
      ctx.fillRect(centerX - 4, centerY - 4, 8, 8);
      return;
    }
    const footY = centerY + Math.round(meta.frame_h / 2) - 1;
    drawSprite(image, meta, frameIndex(meta, coin.age), centerX, footY, coin.vx < 0 ? -1 : 1);
  });
}

// Tóe lửa trên khiên cận vệ (FX_BT_ARMOR_SPARK `impact`, tâm ô = điểm chạm).
function drawSparks() {
  const sparks = state.battle?.sparks || [];
  if (!sparks.length) return;
  const meta = getAnimMeta(SHIELD_GUARD.spark, 'impact');
  const image = spriteImage(SHIELD_GUARD.spark, 'impact');
  if (!meta || !image) return;
  sparks.forEach(spark => {
    const footY = Math.round(spark.y + meta.frame_h / 2 - 1);
    drawSprite(image, meta, frameIndex(meta, spark.time), screenX(spark.x), footY, 1);
  });
}

// ---- Kỹ năng + trạng thái người chơi ----
const SHIELD = SKILLS.SK_LND_TO_LICH_SHIELD;
const TIDE = SKILLS.SK_LND_TIDE;

// Khiên Tô Lịch (FX_LND_TO_LICH_SHIELD, ô 32×48) trước mặt người chơi, chân ô
// trùng chân người chơi.
function drawShield() {
  const shield = state.skills?.shield;
  if (!shield || shield.active <= 0) return;
  const p = state.player;
  const pivotX = p.x + p.w / 2 + p.facing * SHIELD.offsetX;
  drawAnim(SHIELD.fx, shield, pivotX, p.y + p.h, p.facing < 0 ? -1 : 1);
}

// Vòng choáng (FX_BT_STUN 32×16, tâm vòng ở giữa ô) trên đỉnh đầu người chơi.
function drawStun(time) {
  const p = state.player;
  if (!(p.stun > 0)) return;
  const meta = getAnimMeta(STUN_FX.id, STUN_FX.anim);
  const image = spriteImage(STUN_FX.id, STUN_FX.anim);
  const centerY = Math.round(p.y - STUN_FX.lift);
  if (!meta || !image) {
    ctx.fillStyle = '#f2d060';
    ctx.fillRect(screenX(p.x + p.w / 2) - 6, centerY - 1, 12, 2);
    return;
  }
  drawSprite(image, meta, frameIndex(meta, time), screenX(p.x + p.w / 2), centerY + Math.round(meta.frame_h / 2) - 1, 1);
}

// Sóng Triều Cường (FX_LND_TIDE `surge`/`fade`) — đáy sóng trên mặt đất, theo hướng quét.
function drawTide() {
  const tide = state.skills?.tide;
  if (!tide?.active) return;
  if (!drawAnim(TIDE.fx, tide, tide.x, GROUND_Y, tide.direction)) {
    ctx.fillStyle = 'rgba(90, 140, 120, .7)';
    ctx.fillRect(screenX(tide.x) - TIDE.w / 2, GROUND_Y - TIDE.h, TIDE.w, TIDE.h);
  }
}

// ---- Cutscene ----
// Lý Bí trên mặt thành (`plant_flag`, quay phải); cờ PROP_LND_VAN_XUAN_FLAG (map
// prop, pivot bottom-left, lặp theo fps manifest) gắn đầu cán ô 8.
function drawCutscene(time) {
  const cut = state.cutscene;
  if (!cut?.lyBi) return;
  drawAnim('NPC_LY_BI', cut.lyBi, cut.lyBi.x, WALL_Y, 1);
  if (!cut.flag) return;
  const flag = images.maps.props[LND_CUTSCENE.flag.id];
  if (!flag) return;
  const { frame_w: fw, frame_h: fh, frames = 1, fps = 6, pivot = { x: 0, y: fh } } = flag.asset;
  const frame = Math.floor(time * fps) % frames;
  const attachX = screenX(cut.lyBi.x + LND_CUTSCENE.flag.dx);
  const attachY = Math.round(WALL_Y - LND_CUTSCENE.flag.lift);
  drawMapImage(ctx, flag.image, frame * fw, 0, fw, fh, attachX - pivot.x, attachY - pivot.y);
}

// Thứ tự vẽ (CHAPTER.hooks.draw).
export const DRAW_LAYERS = {
  beforeEnemies: () => drawWall(),
  beforePlayer: () => {
    drawBoulders();
    drawCoins();
  },
  afterPlayer: time => {
    drawShield();
    drawStun(time);
    drawSparks();
    drawBoulderWarnings(time);
    drawTide();
    drawCutscene(time);
  }
};
