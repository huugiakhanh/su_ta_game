// Bộ dựng thực thể dùng chung để chương soạn nội dung màn (LEVEL.content):
// quân địch, NPC + lính vây, mốc câu hỏi, vật phẩm thu thập, hàng đợi sinh
// quân, kiểm tra bố cục. Vật cản tĩnh / hazard / đạn: geometry.js
// (makeObstacle, makeHazard, makeProjectile). Không đụng state đang chơi.

import { worldX, groundYAt, flatSpan, terrainLevelAt } from './geometry.js';
import { NPC_RULES, NPC_RESCUE, TERRAIN_CELL } from './config.js';
import { CHAPTER } from './chapter.js';
import { createAnim } from './animation.js';

export function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Enemy trên mặt đất: x = mép trái hitbox, w/h = hitbox (px logic). Lính
// thường (không boss) đi tuần quanh chỗ đứng và đâm khi người chơi tới gần —
// hành vi ở enemies.js (updateGuard), thông số `rules` của sprite `normal`
// (CHAPTER.sprites.enemies.normal.rules). Boss đứng yên.
// `options`: patrolMin/patrolMax/aggroRange ghi đè đoạn tuần tra + tầm phát
// hiện mặc định (vd. lính đấu trường đuổi khắp đấu trường).
// Địa hình (TT-TERRAIN-01): đứng trên mặt đất tại tâm; đoạn tuần tra bị kẹp
// trong đoạn đất phẳng chứa tâm (flatSpan) -> lính không đi xuyên bậc đất.
export function makeEnemy(x, w, h, hp, boss, options = {}) {
  const center = x + w / 2;
  const enemy = {
    x, y: groundYAt(center) - h, w, h, hp, maxHp: hp, boss,
    alive: true, dying: false, hitTimer: 0, anim: createAnim('idle')
  };
  if (boss) return enemy;
  const rules = CHAPTER.sprites.enemies.normal.rules;
  const [flatMin, flatMax] = flatSpan(center);
  return {
    ...enemy,
    facing: -1,
    walking: true,
    patrolMin: Math.max(flatMin + w / 2, options.patrolMin ?? center - rules.patrolRange / 2),
    patrolMax: Math.min(flatMax - w / 2, options.patrolMax ?? center + rules.patrolRange / 2),
    aggroRange: options.aggroRange ?? rules.aggroRange,
    // Cú đâm đang diễn { time, hit } hoặc null.
    action: null,
    attackCooldown: 0
  };
}

// NPC: `centerX` = tâm = pivot bottom-center; x/y/w/h chỉ là hộp F2 (NPC
// không có va chạm). met = đã gặp xong; fade 1 -> 0 sau khi gặp (mờ dần rồi
// biến mất); talking = đang nói thoại (render phát `talk`). `id` = khoá trong
// CHAPTER.sprites.npcs và CHAPTER.dialogues.
export function makeNpc(id, chunk, localX) {
  const centerX = worldX(chunk, localX);
  return {
    id, centerX,
    x: centerX - NPC_RULES.w / 2, y: groundYAt(centerX) - NPC_RULES.h, w: NPC_RULES.w, h: NPC_RULES.h,
    met: false, talking: false, fade: 1
  };
}

// 2 lính canh vây NPC (giải cứu — NPC_RESCUE): 1 bên trái, 1 bên phải, đoạn
// tuần tra phủ tới chỗ người chơi bị giữ trước NPC. `captorOf` = id NPC —
// level-flow.js (updateMeetings) chỉ mở hội thoại khi lính vây đã chết hết.
export function makeCaptors(npc) {
  return [NPC_RESCUE.left, NPC_RESCUE.right].map(side => ({
    ...makeEnemy(npc.centerX + side.dx - 11, 22, 40, 2, false, {
      patrolMin: npc.centerX + side.patrol[0], patrolMax: npc.centerX + side.patrol[1]
    }),
    captorOf: npc.id
  }));
}

// Mốc câu hỏi chặn đường (TT-QUIZ-01): chạm `x` thì level-flow.js mở câu hỏi
// `stt` (CHAPTER.questions) 1 lần. `npc` = id NPC sắp gặp (tiêu đề khung "Câu
// hỏi về …") hoặc null. `footY` = mặt đất dưới bia đá (địa hình TT-TERRAIN-01).
export function makeQuiz(chunk, localX, stt, npc = null) {
  const x = worldX(chunk, localX);
  return { x, footY: groundYAt(x), stt, npc, done: false };
}

// Vật phẩm thu thập (chương Trưng Trắc: bình thư) lơ lửng `lift` px trên mặt
// đất tại chỗ đặt. Phải nhặt đủ mới về đích.
export function makeItem(chunk, localX, lift) {
  const x = worldX(chunk, localX);
  return { x, y: groundYAt(x) - lift, collected: false };
}

// Hàng đợi sinh quân: groups (mỗi nhóm = [{type, at, dx}]) chạy lần lượt,
// nhóm sau bắt đầu khi nhóm trước chết hết + gap giây (kể cả nhóm đầu). loop =
// lặp lại; không lặp thì `done` = true khi nhóm cuối đã chết hết.
// `spawn(entry)` -> enemy (chương dựng quân theo `type`); `x` = toạ độ gốc
// cộng `dx`; `sfx` = tiếng phát khi mỗi nhóm bắt đầu (null = im).
export function makeSpawner(groups, gap, loop, { spawn, x, sfx = null }) {
  return { groups, gap, loop, spawn, x, sfx, index: 0, pending: [], time: 0, wait: gap, done: false };
}

// Vật cản `requiresHole` (cầu) chỉ được giữ khi có hố phủ đúng nhịp cầu;
// thiếu hố thì cảnh báo và bỏ qua (không đặt cầu lơ lửng trên đất liền).
export function keepValidBridges(obstacles, holes) {
  return obstacles.filter(obstacle => {
    if (!obstacle.requiresHole) return true;
    const spans = holes.some(hole => hole.x <= obstacle.x && hole.x + hole.w >= obstacle.x + obstacle.w);
    if (!spans) console.warn(`${obstacle.type} ở x=${obstacle.x} không có hố tương ứng — bỏ qua.`);
    return spans;
  });
}

// Vật tĩnh / hazard / NPC / bia câu hỏi không được đứng vắt qua bậc đất (chân
// phải nằm trọn trên 1 độ cao) — sai thì cảnh báo để phát hiện khi chỉnh
// layout (TT-TERRAIN-01). Cầu (requiresHole) nằm trên hố nên bỏ qua.
export function checkTerrainFootprints(content) {
  const things = [
    ...content.obstacles.filter(item => !item.requiresHole).map(item => ({ name: item.type, x: item.x, w: item.w })),
    ...content.hazards.map(item => ({ name: item.sprite, x: item.x, w: item.w })),
    ...content.npcs.map(item => ({ name: item.id, x: item.x, w: item.w })),
    ...content.quizzes.map(item => ({ name: `bia câu ${item.stt}`, x: item.x - 16, w: 32 }))
  ];
  things.forEach(({ name, x, w }) => {
    const level = terrainLevelAt(x);
    for (let px = x; px < x + w; px += TERRAIN_CELL / 2) {
      if (terrainLevelAt(px) !== level || terrainLevelAt(x + w - 1) !== level) {
        console.warn(`${name} ở x=${Math.round(x)} vắt qua bậc đất`);
        return;
      }
    }
  });
}

// Vật cản / hazard / hố không được nằm trong NPC_RULES.clearance quanh tâm NPC
// (TT-NPC-01 §3.2.2) — sai thì cảnh báo để phát hiện khi chỉnh layout. Lính vây
// NPC (enemy `captorOf`) cố ý đứng sát NPC nên không kiểm tra.
export function checkNpcClearance(content) {
  const things = [
    ...content.obstacles.map(item => ({ name: item.type, x: item.x, w: item.w })),
    ...content.hazards.map(item => ({ name: item.sprite, x: item.x, w: item.w })),
    ...content.holes.map(item => ({ name: 'hố', x: item.x, w: item.w }))
  ];
  things.forEach(thing => content.npcs.forEach(npc => {
    const gap = Math.max(thing.x - npc.centerX, npc.centerX - (thing.x + thing.w), 0);
    if (gap < NPC_RULES.clearance) console.warn(`${thing.name} ở x=${thing.x} cách NPC ${npc.id} ${gap}px < ${NPC_RULES.clearance}px`);
  }));
}
