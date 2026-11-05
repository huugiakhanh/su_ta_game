// Lớp vẽ riêng chương Triệu Việt Vương — gắn vào engine qua CHAPTER.hooks.draw.
// Màn 1–2: bụi cỏ PROP_TQP_GRASS_TUFT (prop map, pivot giữa đáy) vẽ TRƯỚC người
// chơi tại chỗ rắn nằm phục (`state.tufts` = worldX tâm) để che rắn.
// Màn 2 (TQP-L2): bụi lau PROP_TQP_REED_COVER lặp mỗi 64 px trong vùng ẩn nấp
// `state.covers` (vẽ TRƯỚC người chơi, mờ khi người chơi ở trong); rồng vàng
// FX_TQP_GOLDEN_DRAGON sau lưng Chử Đồng Tử (`beforeNpcs`) từ lúc
// `state.dragonTime` khác null.
// Màn 3 (TQP-L3): đuốc tiền cảnh, gáy sáng khi Dương Sàn lún, tóe lửa giáp, Móng
// Rồng trúng gáy, sóng đất, Hiệu triệu, Móng Rồng trên kiếm, màn tối cutscene.
// Không có gì để vẽ thì thoát trước khi tra ảnh (màn 1–2 không nạp sprite màn 3).

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { VIEW_W, VIEW_H, GROUND_Y } from '../../engine/config.js';
import { getAnimMeta, animLength, frameIndex } from '../../engine/animation.js';
import { ctx, drawMapImage, mapWidth, mapHeight, drawAnimated, drawSprite, spriteImage } from '../../engine/render/canvas.js';
import { LEVEL } from '../../engine/chapter.js';
import { SNAKE_AMBUSH, REED_COVER, DRAGON, TORCH, TORCHES, NAPE_GLOW, SPARK, SLAM, SKILLS } from './config.js';
import { napePoint } from './boss.js';

// Vẽ prop map pivot giữa đáy, tâm tại worldX `centerX`, đáy ở GROUND_Y.
function drawGroundProp(id, centerX) {
  const prop = images.maps.props?.[id];
  if (!prop?.image) return;
  const w = mapWidth(prop.image);
  const h = mapHeight(prop.image);
  const left = Math.round(centerX - w / 2 - state.cameraX);
  if (left + w < -16 || left > VIEW_W + 16) return;
  drawMapImage(ctx, prop.image, 0, 0, w, h, left, GROUND_Y - h);
}

function drawTufts() {
  state.tufts?.forEach(centerX => drawGroundProp(SNAKE_AMBUSH.tuft, centerX));
}

// Người chơi đứng trong bụi thì bụi vẽ mờ (`REED_COVER.insideAlpha`) để còn
// thấy mình — bụi đặc che kín nhân vật.
function drawReeds() {
  const p = state.player;
  const center = p.x + p.w / 2;
  state.covers?.forEach(cover => {
    const inside = center >= cover.x && center <= cover.x + cover.w;
    ctx.globalAlpha = inside ? REED_COVER.insideAlpha : 1;
    const count = Math.max(1, Math.round(cover.w / REED_COVER.w));
    for (let i = 0; i < count; i++) drawGroundProp(REED_COVER.prop, cover.x + REED_COVER.w * (i + .5));
  });
  ctx.globalAlpha = 1;
}

function drawDragon() {
  if (state.dragonTime === null || state.dragonTime === undefined) return;
  const npc = state.npcs.find(item => item.id === DRAGON.npc);
  if (!npc || npc.fade <= 0) return;
  const appear = getAnimMeta(DRAGON.id, 'appear');
  const appearTime = appear ? animLength(appear) : 0;
  const pose = state.dragonTime < appearTime
    ? { anim: { name: 'appear', time: state.dragonTime } }
    : { anim: { name: 'idle', time: state.dragonTime - appearTime } };
  drawAnimated(DRAGON.id, { appear: 'appear', idle: 'idle' }, null, pose,
    Math.round(npc.centerX - state.cameraX), npc.y + npc.h, 1, npc.fade);
}

// ---- Màn 3 ----
const screenX = worldX => Math.round(worldX - state.cameraX);

// Ô `time` (giây) của strip `id`/`name`; `loop` = lặp theo thời lượng strip.
function drawFx(id, name, time, pivotWorldX, footY, facing = 1, loop = false) {
  const meta = getAnimMeta(id, name);
  const image = spriteImage(id, name);
  if (!meta || !image) return false;
  const length = animLength(meta);
  const t = loop && length > 0 ? time % length : time;
  drawSprite(image, meta, frameIndex(meta, t), screenX(pivotWorldX), Math.round(footY), facing);
  return true;
}

function drawTorches(time) {
  TORCHES.forEach((x, index) => drawFx(TORCH.id, TORCH.anim, time + index * .23, x, GROUND_Y, 1, true));
}

// Gáy sáng khi Dương Sàn lún: lõi FX (giữa ô 16×16) trùng khe gáy từng ô.
function drawNape(time) {
  const boss = state.battle?.boss;
  if (!boss?.alive || boss.mode !== 'stuck') return;
  const nape = napePoint(boss);
  drawFx(NAPE_GLOW.id, NAPE_GLOW.anim, time, nape.x, nape.y + NAPE_GLOW.lift, 1, true);
}

function drawSparks() {
  state.battle.sparks.forEach(spark => drawFx(SPARK.id, SPARK.anim, spark.time, spark.x, spark.y + 8));
}

// Móng Rồng trúng gáy (`strike` của FX_TQP_DRAGON_CLAW, ô 48×48): giữa vệt chém
// (≈ +7; −15 từ pivot) đặt tại gáy. Không có Móng Rồng thì chỉ tóe lửa.
function drawStrikes() {
  const claw = SKILLS.SK_TQP_DRAGON_CLAW.fx;
  state.battle.strikes.forEach(item => {
    if (item.claw) drawFx(claw, 'strike', item.time, item.x - 7, item.y + 15);
    else drawFx(SPARK.id, SPARK.anim, item.time, item.x, item.y + 8);
  });
}

// Sóng đất: lúc đầm vỡ phát 1 lần tại chỗ; GĐ 3 chạy về mép nước (lặp ảnh).
function drawSlams() {
  state.battle.slams.forEach(slam => drawFx(SLAM.id, SLAM.anim, slam.time, slam.x, GROUND_Y, slam.direction, slam.travel));
}

// Hiệu triệu (FX_TQP_RALLY 96×64) quanh người chơi; Móng Rồng (FX_TQP_DRAGON_CLAW
// 48×48, pivot trùng pivot người chơi): `on` khi vừa bật, `hold` chỉ khi đứng yên
// (FX căn theo kiếm tư thế idle — Gate B2).
function drawSkills() {
  const skills = state.skills;
  if (!skills) return;
  const p = state.player;
  const pivotX = p.x + p.w / 2;
  const footY = p.y + p.h;
  const facing = p.facing < 0 ? -1 : 1;
  if (skills.rally.active) drawFx(SKILLS.SK_TQP_RALLY.fx, 'burst', skills.rally.anim.time, pivotX, footY);
  const claw = skills.claw;
  if (claw.left <= 0) return;
  if (claw.anim.name === 'on') drawFx(SKILLS.SK_TQP_DRAGON_CLAW.fx, 'on', claw.anim.time, pivotX, footY, facing);
  else if (p.anim?.name === 'idle') drawFx(SKILLS.SK_TQP_DRAGON_CLAW.fx, 'hold', claw.anim.time, pivotX, footY, facing, true);
}

// Cutscene: phủ đen theo `fade`.
function drawFade() {
  const fade = state.cutscene?.fade || 0;
  if (fade <= 0) return;
  ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawLevel3(time) {
  if (!state.battle || LEVEL.id !== 3) return;
  drawNape(time);
  drawSparks();
  drawStrikes();
  drawSlams();
  drawSkills();
  drawTorches(time);
  drawFade();
}

export const DRAW_LAYERS = {
  beforeNpcs: drawDragon,
  afterPlayer: time => {
    drawTufts();
    drawReeds();
    drawLevel3(time);
  }
};
