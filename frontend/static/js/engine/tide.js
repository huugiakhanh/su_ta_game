// Thủy triều (NQ-ENGINE E2): đồng hồ triều của màn có `LEVEL.tide` (số ở state.tide.spec).
// Pha: low (nước ròng) -> rising (báo trước `warn` giây) -> high (nước lớn) ->
// falling (`warn` giây) -> low. Hết `rising` thì cột bãi triều (',') thành nước,
// hết `falling` thì thành đất (geometry.js setTide) và state.holes được dựng lại.
// `state.tide.level` 0 (ròng) – 1 (lớn) dùng để vẽ mặt nước + thuyền nổi theo triều.
// Hazard có cờ sprite `tideOnly: 'low'|'high'` chỉ gây sát thương ở pha đó (hazards.js).

import { CHAPTER } from './chapter.js';
import { state } from './state.js';
import { setTide, terrainHoles } from './geometry.js';
import { showMessage } from './ui.js';
import { playSfx } from './audio.js';

const NEXT = { low: 'rising', rising: 'high', high: 'falling', falling: 'low' };

function phaseLength(spec, phase) {
  if (phase === 'low') return spec.low;
  if (phase === 'high') return spec.high;
  return spec.warn;
}

// Pha "đã thành nước": high + falling (bãi còn ngập tới hết falling).
export function tideHigh() {
  return state.tide ? state.tide.phase === 'high' || state.tide.phase === 'falling' : false;
}

// Hazard `tideOnly` đang hoạt động? low = nước ròng (+ đang lên, bãi chưa ngập).
export function tideActive(phase) {
  if (!state.tide) return true;
  return phase === 'high' ? tideHigh() : !tideHigh();
}

function applyFlats(high) {
  if (setTide(high)) state.holes = terrainHoles();
}

function enter(phase) {
  const tide = state.tide;
  tide.phase = phase;
  tide.time = 0;
  if (phase === 'high') applyFlats(true);
  if (phase === 'low') applyFlats(false);
  if (phase === 'rising') {
    if (CHAPTER.text.tideRising) showMessage(CHAPTER.text.tideRising, 2200);
    playSfx('quizOpen');
  }
  if (phase === 'falling' && CHAPTER.text.tideFalling) showMessage(CHAPTER.text.tideFalling, 2200);
}

// Chương ép triều (màn 3 GĐ 2): 'low' | 'high' -> chuyển ngay sang pha báo trước
// rồi đứng yên ở pha đích tới khi forceTide(null).
export function forceTide(target) {
  const tide = state.tide;
  if (!tide) return;
  tide.forced = target;
  if (!target) return;
  const want = target === 'high' ? 'rising' : 'falling';
  if (tide.phase !== target && tide.phase !== want) enter(want);
}

export function updateTide(dt) {
  const tide = state.tide;
  if (!tide) return;
  const spec = tide.spec;
  tide.time += dt;
  const stay = tide.forced && tide.phase === tide.forced;
  if (!stay && tide.time >= phaseLength(spec, tide.phase)) enter(NEXT[tide.phase]);
  const t = Math.min(1, tide.time / Math.max(.01, spec.warn));
  tide.level = tide.phase === 'low' ? 0 : tide.phase === 'high' ? 1 : tide.phase === 'rising' ? t : 1 - t;
}
