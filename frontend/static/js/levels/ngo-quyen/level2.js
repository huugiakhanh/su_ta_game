// Màn 2 "Trận địa cọc ngầm" (NQ-L2, docs/SUTA_NQ_TASK_L2_01.md): 10 chunk ĐẶT CỐ ĐỊNH —
// rừng ven sông + xưởng đẽo cọc (1–3) -> bãi cửa sông lúc triều (4–7) -> bến thuyền ta (8–10).
//   - 3 NPC: Dương Đình Nghệ (chunk 2, cần 3 sách, hồi tưởng 937 — lính Kiều Công Tiễn
//     vây), Kiều Công Hãn (chunk 3, cần 6), Ngô Xương Ngập (chunk 10, cần 10); bia trước
//     mỗi NPC rút 1 câu từ pool của NPC đó.
//   - Cắm cọc (NQ-ENGINE E2 + E5): 2 đống cọc, 6 mốc trên bãi triều, cần 3 mới về đích.
//   - Quân thủy Nam Hán: bè quăng lưới (choáng), thuyền hỏa công trôi; cọc ngầm của ta
//     nguy hiểm lúc nước ròng; cá sấu, gió ngược như màn 1.
// Mọi số DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import { GROUND_Y } from '../../engine/config.js';
import {
  makeEnemy, makeNpc, makeQuiz, makeItem, makeStakeSpot, pick, checkTerrainFootprints, checkNpcClearance
} from '../../engine/entities.js';
import { state } from '../../engine/state.js';
import { showMessage } from '../../engine/ui.js';
import { playSfx } from '../../engine/audio.js';
import {
  QUIZ, SOLDIER, LEVEL2, LEVEL2_CHUNKS, LEVEL2_TERRAIN, LEVEL2_NPCS, CAPTORS, BOAT_FLOAT, WATER_SURFACE, TEXT
} from './config.js';
import { NPC_QUESTION_POOLS } from './questions-data.js';
import { makeBoat, makeGust, returnBoats } from './level1.js';

// Đáy bè quăng lưới chìm 6 px dưới mặt nước (NQ_ART_02: 6 px cuối ô là nước gợn).
const RAFT_SINK = 6;
// Chân cọc ngầm dưới mặt nước: đỉnh cọc nhô 8 px trên mép bờ -> chạm chân người trên thuyền.
const HIDDEN_STAKE_SINK = 4;

function makeNhSoldier(chunk, localX, art = 'nh') {
  return { ...makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false), art };
}

// 2 lính vây NPC: tuần trong đoạn [min, max] quanh tâm NPC, `captorOf` giữ hội thoại.
function makeCaptors(npc, art) {
  return CAPTORS.map(side => ({
    ...makeEnemy(npc.centerX + side.dx - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
      patrolMin: npc.centerX + side.patrol[0], patrolMax: npc.centerX + side.patrol[1]
    }),
    art,
    captorOf: npc.id
  }));
}

function makeRaft(chunk, localX) {
  return makeHazard('thrower', 'netRaft', chunk, localX, {
    groundY: GROUND_Y + WATER_SURFACE + RAFT_SINK, projectile: 'net', fireInterval: 2.6, fireRange: 260, aim: false, hp: 1
  });
}

function makeFireBoat() {
  const { at, speed, travel, gap, triggerRange } = LEVEL2.fireBoat;
  return makeHazard('drift', 'fireBoat', ...at, { groundY: GROUND_Y, floatY: BOAT_FLOAT, speed, travel, gap, triggerRange });
}

export function level2Content() {
  const L = LEVEL2;
  setTerrain(buildTerrain(LEVEL2_TERRAIN, LEVEL2_CHUNKS));
  const npcEntries = Object.entries(LEVEL2_NPCS).map(([id, [chunk, localX, requires, art]]) => ({
    npc: makeNpc(id, chunk, localX, { requires }), art
  }));
  const npcs = npcEntries.map(entry => entry.npc);
  const gust = makeGust(...L.gust);
  const content = {
    obstacles: [],
    hazards: [
      ...L.boats.map(spot => makeBoat(...spot)),
      makeRaft(...L.raft),
      ...L.hiddenStakes.map(spot => makeHazard('prop', 'hiddenStake', ...spot, { groundY: GROUND_Y + WATER_SURFACE + HIDDEN_STAKE_SINK })),
      makeFireBoat(),
      ...L.piles.map(spot => makeHazard('prop', 'stakePile', ...spot)),
      ...gust.hazards,
      makeHazard('lurker', 'crocodile', ...L.crocodile, { groundY: GROUND_Y, floatY: 18 + WATER_SURFACE, hp: 2, triggerRange: 110 })
    ],
    shelters: gust.shelters,
    stakeSpots: L.stakeSpots.map(spot => makeStakeSpot(...spot)),
    holes: terrainHoles(),
    items: L.books.map(([chunk, localX, lift]) => makeItem(chunk, localX, lift)),
    enemies: [
      ...L.soldiers.map(spot => makeNhSoldier(...spot)),
      ...npcEntries.flatMap(({ npc, art }) => makeCaptors(npc, art))
    ],
    npcs,
    // Bia trước mỗi NPC: 1 câu rút ngẫu nhiên trong bộ của NPC (NQ-00 §3.3).
    quizzes: npcs.map(npc => makeQuiz(...QUIZ.level2Spots[npc.id], pick(NPC_QUESTION_POOLS[npc.id]), npc.id))
  };
  checkNpcClearance(content);
  checkTerrainFootprints(content);
  return content;
}

// Sự kiện mỗi frame: thuyền trống về bến, câu hướng dẫn (1 lần mỗi câu, theo thứ
// tự x), nghỉ chân hồi 1 máu.
export function level2Events(p) {
  returnBoats(p);
  const tip = LEVEL2.tips[state.tipIndex];
  if (tip && p.x > worldX(tip[0], tip[1])) {
    state.tipIndex += 1;
    showMessage(tip[2], 3200);
  }
  if (!state.restUsed && p.x > worldX(...LEVEL2.rest)) {
    state.restUsed = true;
    state.health = Math.min(state.maxHealth, state.health + 1);
    playSfx('heal');
    showMessage(TEXT.rest);
  }
}
