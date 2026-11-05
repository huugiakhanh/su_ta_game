// Lớp vẽ riêng chương Triệu Việt Vương — gắn vào engine qua CHAPTER.hooks.draw.
// Màn 1–2: bụi cỏ PROP_TQP_GRASS_TUFT (prop map, pivot giữa đáy) vẽ TRƯỚC người
// chơi tại chỗ rắn nằm phục (`state.tufts` = worldX tâm) để che rắn.
// Màn 2 (TQP-L2): bụi lau PROP_TQP_REED_COVER lặp mỗi 64 px trong vùng ẩn nấp
// `state.covers` (vẽ TRƯỚC người chơi, mờ khi người chơi ở trong); rồng vàng
// FX_TQP_GOLDEN_DRAGON sau lưng Chử Đồng Tử (`beforeNpcs`) từ lúc
// `state.dragonTime` khác null.

import { state } from '../../engine/state.js';
import { images } from '../../engine/assets.js';
import { VIEW_W, GROUND_Y } from '../../engine/config.js';
import { getAnimMeta, animLength } from '../../engine/animation.js';
import { ctx, drawMapImage, mapWidth, mapHeight, drawAnimated } from '../../engine/render/canvas.js';
import { SNAKE_AMBUSH, REED_COVER, DRAGON } from './config.js';

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

export const DRAW_LAYERS = {
  beforeNpcs: drawDragon,
  afterPlayer: () => {
    drawTufts();
    drawReeds();
  }
};
