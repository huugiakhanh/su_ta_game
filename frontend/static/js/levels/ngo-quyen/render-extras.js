// Lớp vẽ riêng chương Ngô Quyền, gắn vào engine qua CHAPTER.hooks.draw.
// Màn 1: ụ thành PROP_NQ_RAMPART (ảnh map, chỉ vẽ — không va chạm) đứng sau cung
// thủ: vẽ ở lớp `beforeNpcs` (sau vật cản, trước hazard).
// Màn 3 (NQ-L3): bãi cọc nhô quanh chân lâu thuyền lúc nước rút, máy bắn đá trên
// boong, bè lao (beforeNpcs — lâu thuyền là hazard nổi vẽ trước lớp nước); đá +
// vạch báo (beforePlayer); FX gỗ vỡ/nước bắn/tóe lửa, cọc sắt K, vệt thuyền L (afterPlayer).
// Không có gì để vẽ thì thoát trước khi tra ảnh (màn khác không nạp sprite màn 3).

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { getAnimMeta, frameIndex, animLength } from '../../engine/animation.js';
import { VIEW_W, VIEW_H, GROUND_Y } from '../../engine/config.js';
import { terrainFlats } from '../../engine/geometry.js';
import { ctx, debugLabels, drawSprite, drawMapImage, mapWidth, mapHeight, spriteImage } from '../../engine/render/canvas.js';
import { TILES, RAMPART, SHIP, CATAPULT, RAFTS, SKILLS, WATER_SURFACE } from './config.js';
import { DECK_Y } from './level3.js';

const screenX = worldX => Math.round(worldX - state.cameraX);
const STAKE = SKILLS.SK_NQ_IRON_STAKE;
const DECOY = SKILLS.SK_NQ_DECOY_BOAT;

// Ô `time` của animation `name` (sprite `id`) tại pivot thế giới; thiếu ảnh thì false.
function drawAt(id, name, time, pivotWorldX, footY, facing = 1, alpha = 1, label = null) {
  const meta = getAnimMeta(id, name);
  const image = spriteImage(id, name);
  if (!meta || !image) return false;
  const frame = frameIndex(meta, time);
  drawSprite(image, meta, frame, screenX(pivotWorldX), Math.round(footY), facing, alpha);
  if (label) debugLabels.set(label, `${id} ${name} ${frame + 1}/${meta.frames}`);
  return true;
}

function drawRamparts() {
  const prop = images.maps.props[RAMPART.prop];
  if (!prop?.image || !state.ramparts) return;
  const w = mapWidth(prop.image);
  const h = mapHeight(prop.image);
  state.ramparts.forEach(centerX => {
    const left = Math.round(centerX - w / 2 - state.cameraX);
    if (left + w < -48 || left > VIEW_W + 48) return;
    drawMapImage(ctx, prop.image, 0, 0, w, h, left, GROUND_Y - h);
  });
}

// ---- Màn 3 ----
const STAKE_FIELD = 'PROP_NQ_STAKE_FIELD';

// Lòng bùn dưới bãi triều lúc nước rút: ảnh bãi triều chỉ cao 16 px (tới
// GROUND_Y + 16), phần dưới còn lộ ảnh nước và đáy lâu thuyền mắc cọc. Lát thêm
// nửa dưới ảnh bãi triều (hàng 8–15) từ GROUND_Y + MUD_BED_FROM tới đáy khung,
// vẽ sau lớp thân thuyền (hazard nổi) nên che đáy thuyền.
const MUD_BED_FROM = 14;
const MUD_BED_ROW = 8;

function drawMudBed() {
  const prop = images.maps.props[TILES.flat];
  const phase = state.tide?.phase;
  if (!prop?.image || !phase || phase === 'high' || phase === 'falling') return;
  const w = mapWidth(prop.image);
  const h = mapHeight(prop.image);
  const top = GROUND_Y + MUD_BED_FROM;
  const imageTop = top - MUD_BED_ROW;
  terrainFlats().forEach(span => {
    const left = screenX(span.x);
    if (left + span.w < -24 || left > VIEW_W + 24) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, Math.round(span.w), VIEW_H - top);
    ctx.clip();
    // GROUND_Y + 14 + (16 − 8) = 270 = VIEW_H: một hàng ảnh là đủ tới đáy khung.
    for (let x = Math.floor(span.x / w) * w; x < span.x + span.w; x += w) drawMapImage(ctx, prop.image, 0, 0, w, h, screenX(x), imageTop);
    ctx.restore();
  });
}

// Bãi cọc lặp ngang dưới thân lâu thuyền, hiện dần theo nước rút (state.midAlt).
function drawStakeField() {
  const battle = state.battle;
  const prop = images.maps.props[STAKE_FIELD];
  if (!battle || !prop?.image || !(state.midAlt > 0)) return;
  const w = mapWidth(prop.image);
  const h = mapHeight(prop.image);
  const from = battle.shipX + SHIP.hullFrom - 24;
  const to = battle.shipX + SHIP.hullTo + 24;
  ctx.save();
  ctx.globalAlpha = Math.min(1, state.midAlt);
  for (let x = from; x < to; x += w) drawMapImage(ctx, prop.image, 0, 0, w, h, screenX(x), GROUND_Y + 6 - h);
  ctx.restore();
}

function drawCatapult() {
  const battle = state.battle;
  // Thuyền đang chìm (cutscene): máy bắn đá chìm theo, không vẽ nữa.
  if (!battle || battle.ship.pose.name === 'sink') return;
  const x = battle.shipX + CATAPULT.dx;
  const tilt = battle.ship.pose.name === 'stuck' || battle.ship.pose.name === 'sink' ? (battle.shipX - x) * SHIP.tilt : 0;
  const anim = battle.catapult.anim;
  drawAt(CATAPULT.id, anim.name, anim.time, x, DECK_Y + tilt, -1, 1, battle.catapult);
}

function drawRafts() {
  const battle = state.battle;
  if (!battle) return;
  const low = (state.midAlt || 0) > 0;
  battle.rafts.forEach(raft => {
    const footY = GROUND_Y + (low ? 2 : WATER_SURFACE + RAFTS.sink - 2);
    drawAt('OB_NQ_JAVELIN_RAFT', 'idle', raft.anim.time, raft.x, footY, raft.dir, raft.has ? 1 : .55, raft);
  });
}

function drawShipLayer(time) {
  drawRamparts();
  if (!state.battle) return;
  drawMudBed();
  drawCatapult();
  drawStakeField();
  drawRafts(time);
}

// Đá OB_BOULDER (`roll` khi bay, `break` khi vỡ) + vạch báo chỗ rơi.
function drawBoulders(time) {
  const boulders = state.battle?.boulders || [];
  boulders.forEach(boulder => {
    if (!boulder.broken) {
      const x = screenX(boulder.targetX);
      if (x > -16 && x < VIEW_W + 16) {
        ctx.fillStyle = Math.floor(time * 10) % 2 === 0 ? 'rgba(240, 200, 80, .9)' : 'rgba(210, 40, 30, .85)';
        ctx.fillRect(x - 9, GROUND_Y - 1, 18, 2);
        ctx.fillRect(x - 1, GROUND_Y - 4, 2, 3);
      }
    }
    if (!drawAt(CATAPULT.boulder, boulder.anim.name, boulder.anim.time, boulder.x, boulder.y + CATAPULT.radius, boulder.vx < 0 ? -1 : 1)) {
      ctx.fillStyle = '#7d7468';
      ctx.fillRect(screenX(boulder.x) - 8, Math.round(boulder.y) - 8, 16, 16);
    }
  });
}

// FX một lượt (gỗ vỡ, nước bắn, tóe lửa giáp boss).
function drawFxs() {
  (state.battle?.fxs || []).forEach(fx => drawAt(fx.id, fx.anim, fx.time, fx.x, fx.footY));
}

// Cọc sắt K: rise -> hold (tới 1,2 s) -> break.
function drawStakeSkill() {
  const fx = state.skills?.stake?.fx;
  if (!fx) return;
  const rise = animLength(getAnimMeta(STAKE.fx, 'rise') || { frames: 1, fps: 1 });
  const breakAt = 1.2;
  if (fx.time < rise) drawAt(STAKE.fx, 'rise', fx.time, fx.x, fx.footY);
  else if (fx.time < breakAt) drawAt(STAKE.fx, 'hold', fx.time - rise, fx.x, fx.footY);
  else drawAt(STAKE.fx, 'break', fx.time - breakAt, fx.x, fx.footY);
}

// Vệt thuyền nhẹ L dưới chân người chơi lúc miễn sát thương.
function drawDecoy() {
  const decoy = state.skills?.decoy;
  if (!decoy || decoy.guard <= 0) return;
  const p = state.player;
  drawAt(DECOY.fx, 'loop', decoy.time, p.x + p.w / 2, p.y + p.h + 6, decoy.dir);
}

function drawAfterPlayer() {
  if (!state.battle && !state.skills) return;
  drawFxs();
  drawStakeSkill();
  drawDecoy();
}

export const DRAW_LAYERS = {
  beforeNpcs: drawShipLayer,
  beforePlayer: time => drawBoulders(time),
  afterPlayer: drawAfterPlayer
};
