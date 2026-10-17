// State của 1 lượt chơi (player/obstacles/holes/items/enemies...).
// `state` bị gán lại TOÀN BỘ object mỗi lần resetGame(), nên export dạng
// live-binding (`let` + setter) để các module khác import { state } luôn
// thấy giá trị mới nhất — đây là hành vi chuẩn của ES module named export.
// Phần khung (người chơi, máu, điểm, thống kê) chung mọi chương; nội dung màn
// do chương dựng (LEVEL.content) bằng các hàm trong entities.js.

import { setTerrain } from './geometry.js';
import { GROUND_Y, INTRO, MAX_HEALTH, PLAYER_SIZE, PLAYER_START_X } from './config.js';
import { CHAPTER, LEVEL } from './chapter.js';
import { createAnim } from './animation.js';
import { makeNpc, makeRidePlatform } from './entities.js';

export let state = null;

export function setState(nextState) {
  state = nextState;
  return state;
}

// Khoá bảng sprite quân địch (CHAPTER.sprites.enemies) của enemy: `art` (vd.
// rusher, dummy...) hoặc boss/normal.
export function enemyArtKey(enemy) {
  return enemy.art || (enemy.boss ? 'boss' : 'normal');
}

// Boss/mini-boss của màn còn sống? (enemy `boss` hoặc hazard `boss`). Giữ
// người chơi ở cổng đích (level-flow.js) và quyết định cổng mở (render).
export function bossAlive(current = state) {
  return current.enemies.some(enemy => enemy.boss && enemy.alive)
    || current.hazards.some(hazard => hazard.boss && hazard.alive);
}

// Trạng thái khe kỹ năng của lượt chơi (màn có LEVEL.skills). `owned` = phần
// thưởng đã nhận (tiến trình) có định nghĩa kỹ năng; phần còn lại do chương tạo.
function createSkillState(rewards) {
  const skills = CHAPTER.skills;
  const owned = new Set(rewards.filter(id => skills.defs[id]));
  return { owned, ...skills.createState(owned) };
}

// State của 1 lượt chơi màn đang chọn (LEVEL). `options.score` = điểm mang
// sang từ màn trước; `options.rewards` = phần thưởng đã nhận; máu luôn đầy khi
// bắt đầu màn (DESIGN_BASELINE). `options.intro` = cảnh vào màn (TT-HERO-01):
// người chơi đứng ngoài mép trái, level-flow.js cho tự chạy tới `intro.targetX`;
// màn có LEVEL.guide thì thêm NPC đứng chờ (`guide`).
export function createLevelState(options = {}) {
  // Mặc định phẳng; LEVEL.content đặt địa hình của màn.
  setTerrain(null);
  const content = LEVEL.content(options);
  const startX = LEVEL.playerStartX ?? PLAYER_START_X;
  const guide = options.intro && LEVEL.guide ? makeNpc(LEVEL.guide.npc, 1, LEVEL.guide.localX) : null;
  return {
    // phase: walk -> talk (đang hội thoại với guide) -> done; onDone do main.js gán.
    intro: options.intro ? { phase: 'walk', targetX: startX, onDone: null } : null,
    guide,
    running: false,
    paused: false,
    won: false,
    cameraX: 0,
    score: options.score ?? 0,
    health: MAX_HEALTH,
    itemsCollected: 0,
    // Thống kê lượt chơi gửi kèm kỷ lục để xét thành tựu (SUTA-DB-01):
    // hitsTaken = lần mất máu do đòn/vật cản/hố (không tính trả lời sai);
    // quizCorrect/quizTotal = câu hỏi chặn đường + câu hỏi NPC (đúng ngay lần đầu).
    stats: { hitsTaken: 0, quizCorrect: 0, quizTotal: 0 },
    // Mốc cốt truyện 1 lần của màn (sự kiện riêng chương đặt cờ này).
    storyShown: false,
    finishX: LEVEL.finishX,
    skills: LEVEL.skills && CHAPTER.skills ? createSkillState(options.rewards || []) : null,
    // Cutscene (chương đặt, thay update() — LEVEL.cutscene); cổng mở trong cutscene.
    cutscene: null,
    gateOpen: false,
    // Hàng đợi sinh quân theo đợt (entities.js makeSpawner) hoặc null.
    spawner: null,
    player: {
      x: options.intro ? INTRO.startX : startX,
      y: GROUND_Y - PLAYER_SIZE.h,
      w: PLAYER_SIZE.w,
      h: PLAYER_SIZE.h,
      normalH: PLAYER_SIZE.h,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: true,
      dashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      attacking: false,
      attackCooldown: 0,
      // Mục tiêu đã trúng trong cú vung hiện tại (mỗi mục tiêu 1 lần/cú).
      attackHits: new Set(),
      hurtTimer: 0,
      invulnerable: 0,
      // Animation đang phát { name, time } — xem animation.js.
      anim: createAnim('idle'),
      // Mốc thời gian (giây, đồng hồ requestAnimationFrame) lúc thua.
      deathTime: null
    },
    projectiles: [],
    // Nội dung mặc định — LEVEL.content ghi đè; trường riêng chương thêm qua
    // CHAPTER.stateFields() (vd. hũ dầu, mưa tên của Trưng Trắc).
    obstacles: [],
    hazards: [],
    holes: [],
    items: [],
    enemies: [],
    npcs: [],
    quizzes: [],
    ...(CHAPTER.stateFields?.() || {}),
    ...content,
    // Bục một chiều của màn + bục tự gắn trên hazard có `ride` (BT-ENGINE E6–E7).
    platforms: [
      ...(content.platforms || []),
      ...(content.hazards || []).map(makeRidePlatform).filter(Boolean)
    ]
  };
}
