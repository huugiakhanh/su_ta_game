// Màn 3 "Đại thắng Bạch Đằng" (NQ-L3, docs/SUTA_NQ_TASK_L3_01.md): đấu trường 1 chunk
// ở cửa sông. Dựng bờ + bãi triều, thuyền nhỏ, lâu thuyền (hazard nổi + vùng chặn),
// 6 mảng giáp, 2 cung thủ trên boong, Lưu Hoằng Tháo, 2 bè lao; diễn biến ở boss.js.
// Mọi số DESIGN_BASELINE.

import { makeEnemy } from '../../engine/entities.js';
import { makeHazard, setTerrain, buildTerrain, terrainHoles } from '../../engine/geometry.js';
import { createAnim } from '../../engine/animation.js';
import { GROUND_Y } from '../../engine/config.js';
import {
  LEVEL3_TERRAIN, LEVEL3_TIDE, SHIP, CATAPULT, DECK_ARCHERS, RAFTS, BOSS, BAIT, WATER_SURFACE
} from './config.js';
import { makeBoat } from './level1.js';

// Mặt boong + đáy lâu thuyền (y thế giới).
export const SHIP_BOTTOM_Y = GROUND_Y + SHIP.bottom;
export const DECK_Y = SHIP_BOTTOM_Y - SHIP.deck;

// Cung thủ trên boong tại pivot thuyền + dx; `harmful: false` để nhảy chạm chân không bị va.
export function makeDeckArcher(shipX, index) {
  return {
    ...makeHazard('thrower', 'deckArcher', 1, shipX + DECK_ARCHERS.dx[index], {
      groundY: DECK_Y, projectile: 'fireArrow', aim: true, hp: 1,
      fireInterval: DECK_ARCHERS.interval, fireRange: DECK_ARCHERS.range, harmful: false
    }),
    // maxHp 0: không vẽ thanh máu trên đầu (1 đòn là hạ).
    fireTimer: 1.5 + index * DECK_ARCHERS.stagger, slot: index, maxHp: 0
  };
}

// Mảng giáp: enemy kind `shipArmor` 24×24, tâm theo SHIP.armor (lật vì mũi quay trái).
function makeArmor(shipX, dx, index) {
  return {
    ...makeEnemy(shipX - dx - 12, 24, 24, SHIP.armorHp, false, {}),
    y: SHIP_BOTTOM_Y - SHIP.armorY - 12,
    art: 'shipArmor', kind: 'shipArmor', facing: -1, walking: false, passive: true, noBar: true,
    dx, slot: index
  };
}

// Lưu Hoằng Tháo: enemy kind `hoangThao` đứng trên boong (y cố định theo DECK_Y).
function makeHoangThao(shipX) {
  return {
    ...makeEnemy(shipX + BOSS.dx - BOSS.w / 2, BOSS.w, BOSS.h, BOSS.hp, true),
    y: DECK_Y - BOSS.h,
    art: 'hoangThao', kind: 'hoangThao', facing: -1, noBar: true,
    mode: 'idle', modeTime: 0, hit: false, dodged: false, swing: 0, waitTime: 0, hurtTime: 0
  };
}

// `options.layout === 'lowtide'`: vào thẳng GĐ 2 (thuyền đã mắc cọc, nước rút).
// `options.stakes` = số cọc đã cắm ở màn 2 (engine NQ-L3) -> số giáp vỡ sẵn 3–6.
export function level3Content(options = {}) {
  const test = options.layout === 'lowtide';
  setTerrain(buildTerrain(LEVEL3_TERRAIN, 1));
  const shipX = test ? SHIP.stuckX : SHIP.startX;
  // `active` false: bục boong (ride) chưa dùng được tới khi mở boong (boss.js).
  const ship = { ...makeHazard('prop', 'ship', 1, shipX, { groundY: GROUND_Y + WATER_SURFACE, floatY: SHIP.bottom - WATER_SURFACE }), facing: -1, active: false };
  ship.pose = { name: test ? 'stuck' : 'idle', time: 0 };
  const hull = { ...makeHazard('prop', 'shipHull', 1, shipX, { groundY: SHIP_BOTTOM_Y }), invisible: true, harmful: false };
  const archers = DECK_ARCHERS.dx.map((dx, index) => makeDeckArcher(shipX, index));
  const armor = SHIP.armor.map((dx, index) => makeArmor(shipX, dx, index));
  const boss = makeHoangThao(shipX);
  const boat = makeBoat(1, 130);
  return {
    obstacles: [], items: [], npcs: [], quizzes: [],
    holes: terrainHoles(),
    hazards: [ship, hull, boat, ...archers],
    enemies: [...armor, boss],
    tideSpec: LEVEL3_TIDE,
    battle: {
      test, phase: test ? 2 : 1, started: false,
      stakes: Math.max(3, Math.min(6, options.stakes || 0)),
      shipX, ship, hull, boat, archers, armor, boss,
      bait: 0, baitMax: BAIT.max, pendingBait: 0, stakeTarget: null,
      transition: null, preBroken: test ? 'pending' : 0, mudTimer: 2, healDropped: false,
      catapult: { anim: createAnim('idle'), shot: null, timer: CATAPULT.interval / 2 },
      boulders: [], fxs: [], stakeFxs: [], archerTimers: [0, 0],
      rafts: RAFTS.xs.map((x, index) => ({ x, dir: index ? -1 : 1, has: true, refill: 0, anim: createAnim('idle') })),
      hintTimer: 0, javelinHintShown: false, boardHintShown: false
    }
  };
}
