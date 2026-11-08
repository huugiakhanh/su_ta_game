// Màn 3 "Công phá Tống Bình" (MHD-L3, docs/SUTA_MHD_TASK_L3_01.md): đấu trường 1
// chunk trước cổng phủ Đô hộ. Dựng nội dung + quân; diễn biến trận ở boss.js.
// Mọi số DESIGN_BASELINE.

import { makeEnemy } from '../../engine/entities.js';
import { readProgress } from '../../engine/progress.js';
import { BOSS, CART, GUARDS, SCOUTS } from './config.js';

// Vệ sĩ khiên sắt: `shieldGuard` -> `burningGuard` -> `bareGuard` (boss.js đổi `art`).
function makeShieldGuard(centerX) {
  return {
    ...makeEnemy(centerX - GUARDS.w / 2, GUARDS.w, GUARDS.h, GUARDS.hp, false, {
      patrolMin: GUARDS.patrol[0], patrolMax: GUARDS.patrol[1], aggroRange: GUARDS.aggroRange
    }),
    art: 'shieldGuard', noBar: true
  };
}

// Lính trinh sát (hành vi `rusher` của engine): chạy về phía người chơi.
export function makeScout(centerX, direction) {
  return {
    ...makeEnemy(centerX - SCOUTS.w / 2, SCOUTS.w, SCOUTS.h, SCOUTS.hp, false, {}),
    art: 'scout', noBar: true, direction, facing: direction, rest: 0
  };
}

// Quang Sở Khách: enemy kind `quangSoKhach`; GĐ 1–2 không mất máu, ẩn thanh máu.
function makeBoss(centerX) {
  return {
    ...makeEnemy(centerX - BOSS.w / 2, BOSS.w, BOSS.h, BOSS.hp, true),
    art: 'quangSoKhach', kind: 'quangSoKhach', facing: -1, noBar: true,
    mode: 'idle', modeTime: 0, hit: false, combo: 0, swing: 0, waitTime: 0, blockedTime: 0, hurtTime: 0
  };
}

// Xe bắn tiễn: enemy kind `arrowCart`, máu do lượt đánh cần (boss.js), không dùng `hp`.
function makeCart(centerX) {
  return {
    ...makeEnemy(centerX - CART.w / 2, CART.w, CART.h, 1, false, {}),
    art: 'arrowCart', kind: 'arrowCart', facing: -1, noBar: true,
    mode: 'idle', modeTime: 0, fired: false, dir: -1, stallLeft: 0, leverTime: 0, leverHits: 0, deck: null, aim: null
  };
}

// `options.layout === 'skills'` -> layout thử: vào thẳng GĐ 2, xe chạy lặp không
// vỡ, trinh sát ra lặp. `battle` = tiến trình trận (boss.js).
export function level3Content(options) {
  const test = options.layout === 'skills';
  const boss = makeBoss(test ? BOSS.phase2X : BOSS.phase1X);
  const cart = makeCart(CART.startX);
  const guards = test ? [] : GUARDS.centers.map(makeShieldGuard);
  return {
    obstacles: [], hazards: [], holes: [], items: [], npcs: [], quizzes: [],
    enemies: [cart, ...guards, boss],
    battle: {
      test, phase: test ? 2 : 1, boss, cart, guards,
      // Số dân phu cứu ở màn 1 (0–5) -> số giây Viện Binh chặn xe.
      rescued: readProgress().rescued || 0,
      // Số lượt đã đánh xong cần điều khiển (0–3).
      round: 0,
      volleyTimer: 1.5, scoutTimer: 1.5, hintTimer: 0, phaseDelay: test ? CART.phase2Delay : 0, jarHintShown: false,
      // FX: tóe lửa; người phi ngựa + cờ trong cutscene.
      sparks: [], rider: null, flagTime: null
    }
  };
}
