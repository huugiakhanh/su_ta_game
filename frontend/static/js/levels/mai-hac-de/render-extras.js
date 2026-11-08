// Lớp vẽ riêng chương Mai Hắc Đế — gắn vào engine qua CHAPTER.hooks.draw.
// Màn 1 (MHD-L1): cửa hang PROP_MHD_CAVE_MOUTH vẽ TRƯỚC hazard (hổ đứng trước
// hang) tại `state.caves`; bụi PROP_MHD_BUSH_COVER vẽ SAU người chơi tại
// `state.bushes` để che nửa dưới cung thủ. Cả hai là prop map pivot giữa đáy,
// worldX = tâm, đáy ở GROUND_Y.
// Màn 3 (MHD-L3): vạch báo loạt tên + cú húc, cờ đen, người phi ngựa, tóe lửa,
// FX 2 kỹ năng, nền cổng Tống Bình. Chỉ vẽ khi có state.battle.

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { VIEW_W, GROUND_Y, PROJECTILE_MAX_RANGE } from '../../engine/config.js';
import { getAnimMeta, animLength, frameIndex } from '../../engine/animation.js';
import { LEVEL } from '../../engine/chapter.js';
import { ctx, drawMapImage, mapWidth, mapHeight, drawSprite, spriteImage } from '../../engine/render/canvas.js';
import { drawPickups } from '../../engine/render/entities.js';
import { BUSH, TIGER_CAVE, BOSS, CART, FLAG, SPARK, SKILLS, GATE_PLATE } from './config.js';
import { cartMuzzle } from './boss.js';

function drawGroundProp(id, centerX) {
  const prop = images.maps.props?.[id];
  if (!prop?.image) return;
  const w = mapWidth(prop.image);
  const h = mapHeight(prop.image);
  const left = Math.round(centerX - w / 2 - state.cameraX);
  if (left + w < -16 || left > VIEW_W + 16) return;
  drawMapImage(ctx, prop.image, 0, 0, w, h, left, GROUND_Y - h);
}

// ---- Màn 3 ----
const screenX = worldX => Math.round(worldX - state.cameraX);
const WARN_COLOR = 'rgba(227, 76, 54, .75)';

// Ô `time` (giây) của strip `id`/`name`; `loop` = lặp theo thời lượng strip.
function drawFx(id, name, time, pivotWorldX, footY, facing = 1, loop = false, alpha = 1) {
  const meta = getAnimMeta(id, name);
  const image = spriteImage(id, name);
  if (!meta || !image) return;
  const length = animLength(meta);
  const t = loop && length > 0 ? time % length : time;
  drawSprite(image, meta, frameIndex(meta, t), screenX(pivotWorldX), Math.round(footY), facing, alpha);
}

// Vạch báo loạt tên: từ giá nỏ qua điểm khoá, dài bằng tầm tên (nhấp nháy).
function drawAimLine(cart, time) {
  if (cart.mode !== 'aim' || !cart.aim || Math.floor(time * 12) % 2) return;
  const muzzle = cartMuzzle(cart);
  const dx = cart.aim.x - muzzle.x;
  const dy = cart.aim.y - muzzle.y;
  const length = Math.hypot(dx, dy) || 1;
  ctx.strokeStyle = WARN_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(screenX(muzzle.x) + .5, Math.round(muzzle.y) + .5);
  ctx.lineTo(screenX(muzzle.x + dx / length * PROJECTILE_MAX_RANGE) + .5, Math.round(muzzle.y + dy / length * PROJECTILE_MAX_RANGE) + .5);
  ctx.stroke();
}

// Vạch dưới đất báo cú húc: từ mũi xe tới tường theo hướng húc.
function drawChargeWarn(cart, time) {
  if (cart.mode !== 'windup' || Math.floor(time * 12) % 2) return;
  const tip = cart.x + cart.w / 2 + cart.facing * CART.ramTip;
  const end = cart.facing > 0 ? LEVEL.worldWidth : 0;
  ctx.fillStyle = WARN_COLOR;
  ctx.fillRect(screenX(Math.min(tip, end)), GROUND_Y - 2, Math.round(Math.abs(end - tip)), 2);
}

function drawFlag() {
  const flagTime = state.battle.flagTime;
  if (flagTime === null) return;
  const foot = GROUND_Y - FLAG.footLift;
  const raise = getAnimMeta(FLAG.id, 'raise');
  const raiseTime = raise ? animLength(raise) : 0;
  if (flagTime < raiseTime) drawFx(FLAG.id, 'raise', flagTime, FLAG.x, foot);
  else drawFx(FLAG.id, 'wave', flagTime - raiseTime, FLAG.x, foot, 1, true);
}

function drawRider() {
  const rider = state.battle.rider;
  if (rider) drawFx(BOSS.id, 'flee', rider.time, rider.x, GROUND_Y, rider.facing, true, rider.alpha);
}

function drawSkills() {
  const skills = state.skills;
  if (!skills) return;
  const p = state.player;
  const pivotX = p.x + p.w / 2;
  const footY = p.y + p.h;
  const fxShell = SKILLS.SK_MHD_VAN_AN_SHELL.fx;
  const shell = skills.shell;
  if (shell.breaking) drawFx(fxShell, 'break', shell.anim.time, pivotX, footY);
  else if (shell.left > 0) drawFx(fxShell, shell.anim.name, shell.anim.time, pivotX, footY, 1, shell.anim.name === 'hold');
  const fxMilitia = SKILLS.SK_MHD_REINFORCE.fx;
  skills.reinforce.sweeps.forEach(sweep => {
    if (sweep.brace) drawFx(fxMilitia, 'brace', sweep.time, sweep.brace.x, GROUND_Y, sweep.brace.facing, true);
    else drawFx(fxMilitia, 'charge', sweep.time, sweep.x, GROUND_Y, sweep.dir, true);
  });
}

// Nền cổng Tống Bình là tấm cảnh khớp đúng đấu trường (cổng, lỗ cắm cờ có toạ độ
// trong ảnh) nên phải đi cùng thế giới. Engine vẽ lớp giữa ở parallax .5: lấy ảnh
// khỏi layers rồi tự vẽ ở đây, và vẽ lại vật nhặt vì đáy ảnh đè lên chúng.
let gatePlate = null;
function drawGatePlate(time) {
  const layers = images.maps.layers;
  if (layers[GATE_PLATE]) {
    gatePlate = layers[GATE_PLATE];
    delete layers[GATE_PLATE];
  }
  if (!gatePlate) return;
  const h = mapHeight(gatePlate);
  drawMapImage(ctx, gatePlate, 0, 0, mapWidth(gatePlate), h, -Math.round(state.cameraX), GROUND_Y - h);
  drawPickups(time);
}

function drawBattleBack(time) {
  if (!state.battle || LEVEL.id !== 3) return;
  drawGatePlate(time);
  drawFlag();
  drawChargeWarn(state.battle.cart, time);
}

function drawBattleFront(time) {
  if (!state.battle || LEVEL.id !== 3) return;
  drawAimLine(state.battle.cart, time);
  drawRider();
  state.battle.sparks.forEach(spark => drawFx(SPARK.id, SPARK.anim, spark.time, spark.x, spark.y + 8));
  drawSkills();
}

export const DRAW_LAYERS = {
  beforeNpcs: time => {
    state.caves?.forEach(centerX => drawGroundProp(TIGER_CAVE.prop, centerX));
    drawBattleBack(time);
  },
  afterPlayer: time => {
    state.bushes?.forEach(centerX => drawGroundProp(BUSH.prop, centerX));
    drawBattleFront(time);
  }
};
