// Bộ dựng thực thể dùng chung để chương soạn nội dung màn (LEVEL.content):
// quân địch, NPC + lính vây, mốc câu hỏi, vật phẩm thu thập, hàng đợi sinh
// quân, kiểm tra bố cục. Vật cản tĩnh / hazard / đạn: geometry.js
// (makeObstacle, makeHazard, makeProjectile). Không đụng state đang chơi.

import { worldX, groundYAt, flatSpan, terrainLevelAt } from './geometry.js';
import { NPC_RULES, NPC_RESCUE, TERRAIN_CELL, JUMP_FORCE, GRAVITY } from './config.js';
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

// Bục một chiều (BT-ENGINE E6): đứng được từ trên, nhảy xuyên từ dưới, đi
// ngang xuyên qua; quân/hazard/đạn không dùng bục. `localX` = mép trái (như
// makeObstacle), `height` = khoảng cách mặt bục tới mặt đất tại tâm bục.
// `y` = mặt trên; `h` chỉ là bề dày vẽ/F2. `sprite` = prop trong map manifest
// chương (thiếu ảnh thì vẽ khối dự phòng). `dx` = quãng dịch frame trước (bục
// gắn hazard — chở người chơi theo).
export const PLATFORM_THICKNESS = 6;

export function makePlatform(chunk, localX, height, w, options = {}) {
  const x = worldX(chunk, localX);
  return {
    x, y: groundYAt(x + w / 2) - height, w, h: PLATFORM_THICKNESS,
    sprite: options.sprite || null, attached: null, dx: 0
  };
}

// Bục gắn trên lưng hazard (BT-ENGINE E7 — voi rừng): sprite hazard khai báo
// `ride: { top, inset }` -> bục rộng hazard.w − 2·inset, mặt bục ở hazard.y +
// top. Vị trí đồng bộ mỗi frame ở hazards.js (syncRidePlatforms).
export function makeRidePlatform(hazard) {
  const ride = CHAPTER.sprites.hazards[hazard.sprite]?.ride;
  if (!ride) return null;
  return {
    x: hazard.x + ride.inset, y: hazard.y + ride.top, w: hazard.w - ride.inset * 2, h: PLATFORM_THICKNESS,
    sprite: null, attached: hazard, dx: 0
  };
}

// Bục đang dùng được: bục tĩnh luôn; bục gắn hazard chỉ khi hazard đã xuất
// hiện (roller đã kích hoạt) và còn sống.
export function platformActive(platform) {
  const owner = platform.attached;
  return !owner || (owner.alive && owner.active);
}

// Nhảy cao tối đa (≈ 83px): JUMP_FORCE² / (2·GRAVITY).
const MAX_JUMP_HEIGHT = JUMP_FORCE * JUMP_FORCE / (2 * GRAVITY);

// Bục tĩnh phải với tới được: mặt bục cao hơn chỗ đứng gần nhất (mặt đất dưới
// bục, hoặc bục khác thấp hơn trong vòng `reach` px ngang) quá tầm nhảy thì
// cảnh báo để phát hiện khi chỉnh layout. Bục chồng NPC/bia câu hỏi cũng cảnh báo.
export function checkPlatformReach(content, reach = 96) {
  const platforms = (content.platforms || []).filter(platform => !platform.attached);
  platforms.forEach(platform => {
    const center = platform.x + platform.w / 2;
    const footholds = [groundYAt(center), ...platforms
      .filter(other => other !== platform && other.y > platform.y
        && other.x - reach < platform.x + platform.w && other.x + other.w + reach > platform.x)
      .map(other => other.y)];
    const rise = Math.min(...footholds) - platform.y;
    if (rise > MAX_JUMP_HEIGHT) console.warn(`bục ở x=${Math.round(platform.x)} cao ${Math.round(rise)}px > tầm nhảy ${Math.round(MAX_JUMP_HEIGHT)}px`);
    const blocked = [...content.npcs.map(npc => npc.centerX), ...content.quizzes.map(quiz => quiz.x)]
      .some(x => x > platform.x && x < platform.x + platform.w);
    if (blocked) console.warn(`bục ở x=${Math.round(platform.x)} chồng lên NPC/bia câu hỏi`);
  });
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
