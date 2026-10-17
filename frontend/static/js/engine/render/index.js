// Vẽ 1 frame lên canvas: nền parallax, mặt đất, cổng đích, vật cản, vật phẩm,
// quân, nhân vật, lớp debug. Chương chèn lớp vẽ riêng qua CHAPTER.hooks.draw
// (beforeEnemies / beforePlayer / afterPlayer) — dùng công cụ trong canvas.js.

import { state } from '../state.js';
import { debug } from '../input.js';
import { VIEW_W, VIEW_H } from '../config.js';
import { CHAPTER } from '../chapter.js';
import { ctx, debugLabels } from './canvas.js';
import { drawBackdrops } from './backdrop.js';
import { drawGround, drawHoles, drawTerrainDebug } from './terrain.js';
import {
  drawFinishGate, drawQuizSteles, drawItems, drawObstacles, drawPlatforms, drawHazards, drawProjectiles, drawEnemies,
  drawNpcs
} from './entities.js';
import { drawPlayer } from './player.js';
import { drawDebugOverlay } from './debug.js';

export { canvas, fitCanvas } from './canvas.js';

export function draw(time = 0) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  debugLabels.clear();
  if (!state) return;
  const layers = CHAPTER.hooks?.draw || {};
  drawBackdrops();
  drawGround();
  drawFinishGate(time);
  drawQuizSteles(time);
  drawHazards(time, true);
  drawHoles();
  drawItems(time);
  drawObstacles();
  drawPlatforms();
  drawNpcs(time);
  drawHazards(time);
  layers.beforeEnemies?.(time);
  drawEnemies();
  drawProjectiles();
  layers.beforePlayer?.(time);
  drawPlayer(time);
  layers.afterPlayer?.(time);
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
