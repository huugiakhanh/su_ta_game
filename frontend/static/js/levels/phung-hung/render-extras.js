// Lớp vẽ màn 3 chương Phùng Hưng, gắn vào engine qua CHAPTER.hooks.draw: lầu cổng và
// boss (đi cùng thế giới, không theo parallax), vạch báo, đá rơi, nhân vật cutscene,
// FX kỹ năng, thanh Nỗi sợ hãi. Chỉ vẽ khi có state.battle.

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { VIEW_W, VIEW_H, GROUND_Y } from '../../engine/config.js';
import { getAnimMeta, animLength, frameIndex } from '../../engine/animation.js';
import { ctx, drawMapImage, mapWidth, mapHeight, drawSprite, spriteImage } from '../../engine/render/canvas.js';
import { drawPickups } from '../../engine/render/entities.js';
import { BOSS, FEAR, GATE, PH_CUTSCENE as CUT, ROCKS, SKILLS } from './config.js';

const SUPPLY = SKILLS.SK_PH_SUPPLY_CUT;
const FIRE = SKILLS.SK_PH_FIRE_DRUM;
const WARN_COLOR = 'rgba(227, 76, 54, .85)';
// Thanh sợ nằm dưới hộp thông báo (hộp cao tới ~34 logic) để không bị che.
const FEAR_BAR = { w: 150, h: 7, y: 36, labelGap: 5, labelY: 42 };
// Tile đất chung là tile ban ngày; phủ tối lúc vẽ để hợp cảnh đêm, không đổi ảnh.
const NIGHT_GROUND = 'rgba(9, 14, 38, .62)';
const WATER_WARN_HALF = 15;
const screenX = worldX => Math.round(worldX - state.cameraX);

// Ô `time` (giây) của strip `id`/`name`; `loop` = lặp theo thời lượng strip.
function drawFx(id, name, time, pivotWorldX, footY, facing = 1, loop = false, alpha = 1) {
  const meta = getAnimMeta(id, name);
  const image = spriteImage(id, name);
  if (!meta || !image) return;
  const length = animLength(meta);
  const t = loop && length > 0 ? time % length : time;
  drawSprite(image, meta, frameIndex(meta, t), screenX(pivotWorldX), Math.round(footY), facing, alpha);
}

function drawGate() {
  const prop = images.maps.props[state.battle.gateOpen ? GATE.open : GATE.closed];
  if (!prop?.image) return;
  const h = mapHeight(prop.image);
  drawMapImage(ctx, prop.image, 0, 0, mapWidth(prop.image), h, screenX(GATE.x - prop.asset.pivot.x), GROUND_Y - h);
}

function drawGateTorches(time) {
  GATE.torches.forEach(([dx, height]) => drawFx(GATE.torch, 'loop', time + dx, GATE.x + dx, GROUND_Y - height, 1, true));
}

function drawBoss() {
  const { pose, time } = state.battle.boss;
  const loop = pose === 'idle' || pose === 'fear';
  drawFx(BOSS.id, pose, time, GATE.x, GROUND_Y - GATE.floor, 1, loop);
}

// Vạch đỏ dưới đất báo sắp đổ nước sôi (ảnh `warn` rất nhỏ).
function drawWaterWarnings(time) {
  if (Math.floor(time * 10) % 2) return;
  ctx.fillStyle = WARN_COLOR;
  state.hazards.forEach(hazard => {
    if (hazard.kind !== 'vent' || hazard.ventState !== 'warn') return;
    ctx.fillRect(screenX(hazard.x + hazard.w / 2 - WATER_WARN_HALF), GROUND_Y - 2, WATER_WARN_HALF * 2, 2);
  });
}

function drawRock(rock, time) {
  const foot = rock.y + ROCKS.h;
  if (rock.mode === 'warn') {
    if (Math.floor(time * 12) % 2 === 0) {
      ctx.fillStyle = WARN_COLOR;
      ctx.fillRect(screenX(rock.x - ROCKS.w / 2), GROUND_Y - 2, ROCKS.w, 2);
    }
    drawFx(ROCKS.id, 'warn', rock.time, rock.x, foot, 1, true);
  } else if (rock.mode === 'fall') {
    drawFx(ROCKS.id, 'fall', rock.time, rock.x, foot, 1, true);
  } else if (rock.mode === 'landed') {
    drawFx(ROCKS.id, 'landed', 0, rock.x, foot);
  } else {
    drawFx(ROCKS.id, 'break', rock.time, rock.x, foot);
  }
}

function drawMarchers(time) {
  const battle = state.battle;
  battle.marchers?.forEach(({ id, x, facing }) => drawFx(id, 'talk', time, x, GROUND_Y, facing, true));
  if (battle.lord) drawFx(CUT.lord, 'walk', time, battle.lord.x, GROUND_Y, 1, true, battle.lord.alpha);
}

function drawSkillFx(time) {
  const skills = state.skills;
  if (!skills) return;
  const p = state.player;
  const { supply, fire } = skills;
  const castLength = id => animLength(getAnimMeta(id, 'cast') || { frames: 1, fps: 1 });
  if (supply.castTime < castLength(SUPPLY.fx)) drawFx(SUPPLY.fx, 'cast', supply.castTime, p.x + p.w / 2, p.y + p.h);
  if (fire.castTime < castLength(FIRE.fx)) drawFx(FIRE.fx, 'cast', fire.castTime, fire.x, fire.footY);
  state.enemies.forEach(enemy => {
    if (!enemy.soldier || !enemy.alive) return;
    const center = enemy.x + enemy.w / 2;
    if (enemy.panicLeft > 0) drawFx(FIRE.stunFx, 'loop', time, center, enemy.y);
    else if (supply.left > 0) drawFx(SUPPLY.fx, 'hold', time, center, enemy.y + enemy.h, 1, true);
  });
}

// Thanh Nỗi sợ hãi cố định đầu màn hình.
function drawFearBar() {
  const { fear } = state.battle;
  const x = Math.round(VIEW_W / 2 - FEAR_BAR.w / 2);
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#16100c';
  ctx.fillText('Nỗi sợ hãi', x - FEAR_BAR.labelGap + .5, FEAR_BAR.labelY + .5);
  ctx.fillStyle = '#f2dfb6';
  ctx.fillText('Nỗi sợ hãi', x - FEAR_BAR.labelGap, FEAR_BAR.labelY);
  ctx.fillStyle = '#1a0c08';
  ctx.fillRect(x, FEAR_BAR.y, FEAR_BAR.w, FEAR_BAR.h);
  ctx.fillStyle = '#3a2a22';
  ctx.fillRect(x + 1, FEAR_BAR.y + 1, FEAR_BAR.w - 2, FEAR_BAR.h - 2);
  ctx.fillStyle = fear >= FEAR.panicAt ? '#e34c36' : '#e2ad45';
  ctx.fillRect(x + 1, FEAR_BAR.y + 1, Math.round((FEAR_BAR.w - 2) * fear / FEAR.max), FEAR_BAR.h - 2);
}

export const DRAW_LAYERS = {
  beforeNpcs: time => {
    if (!state.battle) return;
    ctx.fillStyle = NIGHT_GROUND;
    ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    drawGate();
    drawGateTorches(time);
    drawBoss();
    drawWaterWarnings(time);
    // Đáy lầu cổng đè lên vật nhặt nên vẽ lại.
    drawPickups(time);
  },
  beforePlayer: time => {
    if (state.battle) drawMarchers(time);
  },
  afterPlayer: time => {
    const battle = state.battle;
    if (!battle) return;
    battle.rocks.forEach(rock => drawRock(rock, time));
    battle.fxs.forEach(fx => drawFx(fx.id, fx.anim, fx.time, fx.x, fx.footY));
    drawSkillFx(time);
    if (!state.cutscene) drawFearBar();
  }
};
