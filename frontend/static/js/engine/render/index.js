// Vẽ 1 frame lên canvas: nền parallax, mặt đất, cổng đích, vật cản, vật phẩm,
// quân, nhân vật, lớp debug. Chương chèn lớp vẽ riêng qua CHAPTER.hooks.draw
// (beforeNpcs / beforeEnemies / beforePlayer / afterPlayer) — dùng công cụ trong canvas.js.

import { state } from '../state.js';
import { debug } from '../input.js';
import { VIEW_W, VIEW_H } from '../config.js';
import { CHAPTER } from '../chapter.js';
import { images } from '../assets.js';
import { ctx, debugLabels } from './canvas.js';
import { drawBackdrops } from './backdrop.js';
import { drawGround, drawHoles, drawWaterBanks, drawMud, drawFlats, drawTerrainDebug } from './terrain.js';
import {
  drawFinishGate, drawQuizSteles, drawItems, drawPickups, drawObstacles, drawPlatforms, drawHazards, drawProjectiles, drawEnemies,
  drawNpcs, drawCarried, drawRunners, drawExtras, drawDecoys, drawStakeSpots, drawMount
} from './entities.js';
import { drawPlayer } from './player.js';
import { drawDebugOverlay } from './debug.js';

export { canvas, fitCanvas } from './canvas.js';

// Cùng màu nền `.loading-note--blocking` (game.css).
const LOADING_FILL = '#120c08';

export function draw(time = 0) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  debugLabels.clear();
  if (!state) return;
  // Chưa tải xong asset: nền tối (màn hình chờ DOM nằm trên), không vẽ màn bằng
  // màu/hộp tạm.
  if (!images.loaded) {
    ctx.fillStyle = LOADING_FILL;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    return;
  }
  const layers = CHAPTER.hooks?.draw || {};
  // Rung màn hình (BT-L3 E3): lệch camera ngang trong frame này rồi trả lại.
  const shake = state.cameraShake;
  const shakeX = shake ? Math.round((Math.random() * 2 - 1) * shake.amp * shake.time / shake.total) : 0;
  state.cameraX += shakeX;
  drawBackdrops();
  drawGround();
  drawFinishGate(time);
  drawQuizSteles(time);
  drawWaterBanks();
  drawHazards(time, true);
  drawHoles();
  drawMud();
  drawFlats(time);
  drawItems(time);
  drawExtras(time);
  drawDecoys(time);
  drawStakeSpots(time);
  drawPickups(time);
  drawObstacles();
  drawPlatforms();
  layers.beforeNpcs?.(time);
  drawNpcs(time);
  drawHazards(time);
  layers.beforeEnemies?.(time);
  drawEnemies();
  drawProjectiles();
  drawRunners();
  layers.beforePlayer?.(time);
  drawMount();
  drawPlayer(time);
  drawCarried(time);
  layers.afterPlayer?.(time);
  state.cameraX -= shakeX;
  // Cutscene: tối dần/sáng lại (fade 0..1).
  if (state.cutscene?.fade > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${state.cutscene.fade})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (debug.enabled) {
    drawTerrainDebug();
    drawDebugOverlay();
  }
}
