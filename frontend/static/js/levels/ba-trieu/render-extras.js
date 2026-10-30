// Lớp vẽ riêng chương Bà Triệu (màn 3, BT-L3) — gắn vào engine qua
// CHAPTER.hooks.draw: đài chỉ huy + Lục Dận trên đài/đang rơi (trước quân);
// tiền vàng (trước người chơi); khiên mây tre, vòng choáng, tên độc + vạch
// báo, tóe lửa giáp, chí mạng, Bạch Tượng, voi + cờ cutscene (sau người chơi).
// Không có gì để vẽ thì thoát trước khi tra ảnh (màn 1–2 không nạp sprite màn 3).

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { getAnimMeta, frameIndex } from '../../engine/animation.js';
import { VIEW_W, GROUND_Y } from '../../engine/config.js';
import { ctx, debugLabels, drawSprite, drawMapImage, spriteImage, facingDirection } from '../../engine/render/canvas.js';
import {
  BOSS_LD, COMMAND_TOWER, POISON_ARROWS, GOLD_COIN, STUN_FX, ARMORED_CAVALRY, SKILLS, BT_CUTSCENE
} from './config.js';

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

// ---- Boss ----
// Đài chỉ huy (đứng yên -> rung -> sụp, ô cuối = đống đổ) + Lục Dận trên sàn
// (quay về người chơi) hoặc đang rơi.
function drawCommandTower() {
  const battle = state.battle;
  if (!battle?.tower) return;
  const tower = battle.tower;
  if (!drawAnim(COMMAND_TOWER.id, tower, COMMAND_TOWER.x, GROUND_Y, 1)) {
    ctx.fillStyle = '#7a5a2a';
    ctx.fillRect(screenX(COMMAND_TOWER.x) - 20, GROUND_Y - COMMAND_TOWER.floor, 40, COMMAND_TOWER.floor);
  }
  const commander = battle.commander;
  if (commander) {
    const facing = facingDirection(COMMAND_TOWER.x, 0, true);
    drawAnim(BOSS_LD.id, commander, COMMAND_TOWER.x, GROUND_Y - COMMAND_TOWER.floor, facing);
  }
  const fall = battle.fall;
  if (fall && fall.x !== undefined) {
    drawAnim(BOSS_LD.id, fall, fall.x, GROUND_Y - fall.height, facingDirection(fall.x, 0, true));
  }
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

// Tên độc: vạch báo nhấp nháy trên đất (vẽ bằng code) lúc báo trước + lúc rơi;
// mũi PJ_BT_POISON_ARROW (mũi ở đáy ô) vẽ tại (x, tipY).
function drawArrows(time) {
  const arrows = state.battle?.arrows || [];
  if (!arrows.length) return;
  arrows.forEach(arrow => {
    const x = screenX(arrow.x);
    if (x < -16 || x > VIEW_W + 16) return;
    const blink = arrow.warn > 0 && Math.floor(time * 10) % 2 === 0;
    ctx.fillStyle = blink ? 'rgba(150, 230, 90, .9)' : 'rgba(210, 40, 30, .85)';
    ctx.fillRect(x - 7, GROUND_Y - 1, 14, 2);
    ctx.fillRect(x - 1, GROUND_Y - 4, 2, 3);
  });
  const meta = getAnimMeta(POISON_ARROWS.id, POISON_ARROWS.anim);
  const image = spriteImage(POISON_ARROWS.id, POISON_ARROWS.anim);
  arrows.filter(arrow => arrow.warn <= 0).forEach(arrow => {
    const x = screenX(arrow.x);
    const tipY = Math.round(arrow.tipY);
    if (meta && image) drawSprite(image, meta, 0, x, tipY, 1);
    else {
      ctx.fillStyle = '#3c5a20';
      ctx.fillRect(x - 1, tipY - 18, 2, 18);
    }
  });
}

// Tóe lửa trên giáp kỵ binh (FX_BT_ARMOR_SPARK `impact`, tâm ô = điểm chạm).
function drawSparks() {
  const sparks = state.battle?.sparks || [];
  if (!sparks.length) return;
  const meta = getAnimMeta(ARMORED_CAVALRY.spark, 'impact');
  const image = spriteImage(ARMORED_CAVALRY.spark, 'impact');
  if (!meta || !image) return;
  sparks.forEach(spark => {
    const footY = Math.round(spark.y + meta.frame_h / 2 - 1);
    drawSprite(image, meta, frameIndex(meta, spark.time), screenX(spark.x), footY, 1);
  });
}

// ---- Kỹ năng + trạng thái người chơi ----
const SHIELD = SKILLS.SK_BT_RATTAN_SHIELD;
const ELEPHANT = SKILLS.SK_BT_WHITE_ELEPHANT;
const CRIT = SKILLS.BUFF_BT_CRIT;

// Khiên mây tre (FX_BT_RATTAN_SHIELD, ô 32×48) đặt trước mặt người chơi, chân ô
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

// Chí mạng (FX_BT_CRIT `impact` 32×32, tâm ô tại điểm trúng).
function drawCrits() {
  const crits = state.skills?.crits || [];
  if (!crits.length) return;
  const meta = getAnimMeta(CRIT.fx, 'impact');
  const image = spriteImage(CRIT.fx, 'impact');
  if (!meta || !image) return;
  crits.forEach(crit => {
    drawSprite(image, meta, frameIndex(meta, crit.time), screenX(crit.x), Math.round(crit.y + meta.frame_h / 2 - 1), 1);
  });
}

// Bạch Tượng kỹ năng (NPC_BACH_TUONG `charge`) — chân trên mặt đất, theo hướng lao.
function drawElephant() {
  const elephant = state.skills?.elephant;
  if (!elephant?.active) return;
  if (!drawAnim(ELEPHANT.sprite, elephant, elephant.x, GROUND_Y, elephant.direction)) {
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(screenX(elephant.x) - ELEPHANT.w / 2, GROUND_Y - ELEPHANT.h, ELEPHANT.w, ELEPHANT.h);
  }
}

// ---- Cutscene ----
// Bạch Tượng cúi chào, rồi Bà Triệu cưỡi voi (PLAYER_BA_TRIEU_ELEPHANT); cờ
// PROP_BT_VICTORY_FLAG (map prop, pivot bottom-left, lặp theo fps manifest)
// cắm trên đống đổ đài chỉ huy (BT_CUTSCENE.flag).
function drawCutscene(time) {
  const cut = state.cutscene;
  if (!cut?.elephant) return;
  const id = cut.elephant.rider ? 'PLAYER_BA_TRIEU_ELEPHANT' : ELEPHANT.sprite;
  drawAnim(id, cut.elephant, cut.elephant.x, GROUND_Y, 1);
  if (!cut.flag) return;
  const flag = images.maps.props[BT_CUTSCENE.flag.id];
  if (!flag) return;
  const { frame_w: fw, frame_h: fh, frames = 1, fps = 6, pivot = { x: 0, y: fh } } = flag.asset;
  const frame = Math.floor(time * fps) % frames;
  drawMapImage(ctx, flag.image, frame * fw, 0, fw, fh, screenX(BT_CUTSCENE.flag.x) - pivot.x, GROUND_Y - BT_CUTSCENE.flag.lift - pivot.y);
}

// Thứ tự vẽ (CHAPTER.hooks.draw).
export const DRAW_LAYERS = {
  beforeEnemies: () => drawCommandTower(),
  beforePlayer: () => drawCoins(),
  afterPlayer: time => {
    drawShield();
    drawStun(time);
    drawSparks();
    drawCrits();
    drawArrows(time);
    drawElephant();
    drawCutscene(time);
  }
};
