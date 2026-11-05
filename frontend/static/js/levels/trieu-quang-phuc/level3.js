// Màn 3 "Đại phá Dương Sàn" (TQP-L3, docs/archive/SUTA_TQP_TASK_L3_01.md): đấu trường 1
// chunk — bãi lầy Dạ Trạch nửa đêm trước trại Lương, 2 dải sình + 2 mỏm đất.
// Dựng nội dung + quân; diễn biến trận boss ở boss.js. Mọi số DESIGN_BASELINE.

import { makeEnemy } from '../../engine/entities.js';
import { makeHazard, setTerrain, buildTerrain } from '../../engine/geometry.js';
import { GROUND_Y } from '../../engine/config.js';
import { ARENA, SOLDIER, BOSS, MOUNDS, CANOES, LEVEL3_TERRAIN, REINFORCE, SKILL_TEST } from './config.js';

// Lính đánh thuê: hành vi `guard` của engine, thấy người chơi ở mọi chỗ.
export function makeMercenary(centerX) {
  return {
    ...makeEnemy(centerX - SOLDIER.w / 2, SOLDIER.w, SOLDIER.h, SOLDIER.hp, false, {
      patrolMin: 20, patrolMax: ARENA.width - 20, aggroRange: ARENA.width
    }),
    art: 'mercenary'
  };
}

// Cung thủ đứng đất ở mép đấu trường: thrower bắn tên nỏ nhắm vào người chơi.
export function makeArcher(centerX) {
  return makeHazard('thrower', 'archer', 1, centerX, {
    groundY: GROUND_Y, projectile: 'crossbowBolt', aim: true, hp: REINFORCE.archer.hp,
    fireInterval: REINFORCE.archer.fireInterval, fireRange: REINFORCE.archer.fireRange
  });
}

// Mỏm đất: hazard `prop` có bục trên lưng (engine tự gắn bục `ride`).
function makeMound(centerX) {
  return makeHazard('prop', 'dirtMound', 1, centerX, { groundY: GROUND_Y });
}

// Thuyền độc mộc nổi trong khe nước (GĐ 3 — boss.js thêm khi đầm vỡ).
export function makeCanoe(centerX) {
  return makeHazard('prop', 'canoe', 1, centerX, { groundY: GROUND_Y, floatY: CANOES.floatY });
}

// Dương Sàn: enemy kind `duongSan` (boss.js). `mode` = hành động đang diễn,
// `modeTime` = giây trong hành động; chân luôn ở GROUND_Y (hitbox đổi cao khi lún).
export function makeDuongSan(centerX) {
  return {
    ...makeEnemy(centerX - BOSS.w / 2, BOSS.w, BOSS.h, BOSS.hp, true),
    art: 'duongSan', kind: 'duongSan', facing: -1,
    mode: 'idle', modeTime: 0, hit: false, chargeDir: 0, chargeTarget: 0,
    attackCooldown: 1, chargeCooldown: BOSS.startDelay + 1, blockedTime: 0
  };
}

// Nội dung màn 3. `options.layout === 'skills'` -> layout thử kỹ năng: Dương Sàn
// lún mãi ở dải sình trái (không đổi giai đoạn), lính đánh thuê ra lặp.
// `battle` = tiến trình trận (boss.js).
export function level3Content(options) {
  const test = options.layout === 'skills';
  setTerrain(buildTerrain([{ chunk: 1, rows: LEVEL3_TERRAIN.battle }], 1));
  const boss = makeDuongSan(test ? SKILL_TEST.bossX : BOSS.startX);
  // Layout thử: lún sẵn — hitbox hạ tới khe gáy như boss.js setStuckBox.
  if (test) Object.assign(boss, { mode: 'stuck', test: true, h: BOSS.stuckH, y: GROUND_Y - BOSS.stuckH });
  return {
    obstacles: [], holes: [], items: [], npcs: [], quizzes: [],
    hazards: MOUNDS.map(makeMound),
    enemies: [boss],
    battle: {
      test, phase: 1, boss,
      // Số mốc máu đã qua (lượt bổ gáy thành công, 0–3).
      round: 0,
      // Gọi viện: hẹn giờ lệnh kế; cung thủ đang trên sân.
      reinforceTimer: test ? SKILL_TEST.respawnGap : REINFORCE.startDelay, archer: null,
      // Gợi ý giáp/gáy — đếm ngược tới lần được hiện lại.
      hintTimer: 0,
      // GĐ 3: hẹn giờ cuồng nộ kế; chuyển giai đoạn (rage -> đầm vỡ).
      rageTimer: 0, transition: null,
      // FX: tóe lửa trên giáp, Móng Rồng trúng gáy, sóng đất.
      sparks: [], strikes: [], slams: []
    }
  };
}
