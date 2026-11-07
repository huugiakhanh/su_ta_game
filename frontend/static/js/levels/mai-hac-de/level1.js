// Màn 1 "Gánh cống Hoan Châu" — bố cục khung MHD-SKELETON (cố định), asset chương
// 4: 3 lính, 1 hố chông, 5 Quyển Sách Tinh Hoa, 4 câu hỏi chặn đường, đích cuối
// màn. Bố cục thật (gánh cống phẩm, xe cống, 8 chướng ngại + mini-boss quan thu thuế)
// làm ở MHD-L1. DESIGN_BASELINE.

import { worldX, makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import { state } from '../../engine/state.js';
import { makeEnemy, makeQuiz, makeItem, shuffle, checkTerrainFootprints } from '../../engine/entities.js';
import { QUIZ, SOLDIER, ENGINE_TEST, LEVEL1_CHUNKS } from './config.js';
import { LEVEL1_QUESTION_POOL } from './questions-data.js';

// Mỗi lượt rút QUIZ.level1Count câu KHÔNG trùng, đặt lần lượt vào level1Spots.
function level1Quizzes() {
  const chosen = shuffle(LEVEL1_QUESTION_POOL).slice(0, QUIZ.level1Count);
  return chosen.map((stt, index) => makeQuiz(...QUIZ.level1Spots[index], stt));
}

// Lính (hành vi guard của engine) đứng tâm tại worldX(chunk, localX).
function makeSoldier(chunk, localX) {
  return makeEnemy(worldX(chunk, localX) - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false);
}

// Layout thử `?layout=engine` (MHD-ENGINE): gánh nặng (chunk 1), xe chặn đường thả
// người (2), hổ vồ + khe hố (3), quan ném hòm rỗng (4), hũ dầu + bao cát (5).
function engineTestLayout() {
  const t = ENGINE_TEST;
  setTerrain(buildTerrain([{ chunk: 3, rows: t.hole }], LEVEL1_CHUNKS));
  const [spanChunk, spanMin, spanMax] = t.tigerSpan;
  const officialX = worldX(...t.official);
  const official = makeHazard('patrol', 'taxOfficial', ...t.official, {
    hp: 6, speed: 30, projectile: 'emptyChest', fireInterval: 2.2, fireRange: 240, harmful: false
  });
  const jarGuards = t.jarGuards.map(([chunk, localX]) => ({ ...makeSoldier(chunk, localX), dropsJar: true }));
  return {
    layoutTest: 'engine',
    burden: {},
    obstacles: [],
    hazards: [
      ...t.carts.map(([chunk, localX]) => makeHazard('prop', 'tributeCart', chunk, localX, { hp: 2, frees: 1 })),
      makeHazard('pounce', 'tiger', ...t.tiger, {
        hp: 3, triggerRange: 220, span: [worldX(spanChunk, spanMin), worldX(spanChunk, spanMax)]
      }),
      { ...official, patrolMin: officialX - 80, patrolMax: officialX + 80 }
    ],
    holes: terrainHoles(),
    items: [],
    enemies: [...jarGuards, { ...makeSoldier(...t.sandbag), kind: 'testBag', hp: 3, maxHp: 3 }],
    npcs: [],
    quizzes: []
  };
}

// Móc chương chỉ có tác dụng ở layout thử (bố cục thật làm ở MHD-L1/L3).
export const ENGINE_TEST_HOOKS = {
  dropCarry: target => (target.dropsJar ? 'oilJar' : null),
  onBurdenAttack: p => Math.abs(p.x + p.w / 2 - worldX(...ENGINE_TEST.cartMark)) <= ENGINE_TEST.reach,
  onThrownHit(thrown, target) {
    if (target.kind !== 'testBag') return false;
    target.hp -= 1;
    target.hitTimer = .18;
    if (target.hp <= 0) target.alive = false;
    state.score += 100;
    return true;
  }
};
export const ENGINE_TEST_KINDS = { testBag: { update() {}, blockStrike: () => true } };

export function level1Content(options = {}) {
  if (options.layout === 'engine') return engineTestLayout();
  const content = {
    obstacles: [],
    hazards: [makeHazard('trap', 'bambooPit', 1, 492, { harmful: false, triggerDistance: 58 })],
    holes: [],
    items: [
      makeItem(1, 300, 56),
      makeItem(2, 450, 60),
      makeItem(3, 120, 52),
      makeItem(4, 420, 80),
      makeItem(5, 300, 60)
    ],
    enemies: [
      makeSoldier(2, 600),
      makeSoldier(4, 250),
      makeSoldier(5, 680)
    ],
    npcs: [],
    quizzes: level1Quizzes()
  };
  checkTerrainFootprints(content);
  return content;
}
