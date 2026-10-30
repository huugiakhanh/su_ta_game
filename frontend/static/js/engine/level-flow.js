// Vòng mô phỏng 1 frame của màn (update) — mọi thứ khác chỉ đọc/ghi state.
// Chung mọi chương: cảnh vào màn, người chơi, quân, hazard, đạn, sinh quân,
// vật phẩm, câu hỏi chặn đường, gặp/giải cứu NPC, về đích, camera. Phần riêng
// chương gắn qua LEVEL.update (trận boss), LEVEL.events (sự kiện màn),
// LEVEL.cutscene (thay update khi state.cutscene) và CHAPTER.skills.

import { state, bossAlive } from './state.js';
import { pressed } from './input.js';
import { showMessage, tickMessage, updateHud } from './ui.js';
import { aabb } from './geometry.js';
import { setAnim, tickAnim } from './animation.js';
import { VIEW_W, VIEW_H, NPC_RULES, NPC_RESCUE, INTRO, ITEM_HITBOX } from './config.js';
import { CHAPTER, LEVEL } from './chapter.js';
import { openNpcDialogue, openStory, openQuiz } from './dialogue.js';
import { playSfx } from './audio.js';
import { respawnAfterFall } from './damage.js';
import { updatePlayerControl, updateAttack, updatePlayerAnimation } from './player.js';
import { updateEnemies, updateSpawner, touchEnemies } from './enemies.js';
import { updateHazards, updateProjectiles } from './hazards.js';
import { endGame } from './end-game.js';

// Cảnh vào màn (TT-HERO-01), người chơi không điều khiển: tự chạy từ ngoài mép
// trái tới intro.targetX (bỏ qua kẹp x ≥ 12 / tường đấu trường). Màn có NPC
// dẫn (state.guide, LEVEL.guide) -> mở cốt truyện, đóng xong mới vào chơi. Kết
// thúc thì gọi intro.onDone (main.js: thông báo nhiệm vụ + nhạc); đồng hồ màn
// chỉ chạy khi state.intro = null (countsLevelTime ở main.js).
function updateIntro(dt) {
  const intro = state.intro;
  const p = state.player;
  tickMessage(dt);
  // Bỏ phím bấm trong lúc chạy vào — không để dồn 1 cú nhảy/đánh sau intro.
  pressed.jump = pressed.attack = pressed.dash = false;
  let playerAnim = 'idle';

  if (intro.phase === 'walk') {
    p.facing = 1;
    p.x = Math.min(intro.targetX, p.x + INTRO.walkSpeed * dt);
    playerAnim = 'run';
    if (p.x >= intro.targetX) {
      // Tới nơi thì đứng yên (hội thoại dừng game ngay frame này).
      playerAnim = 'idle';
      const guide = state.guide;
      if (guide) {
        intro.phase = 'talk';
        guide.talking = true;
        openStory(LEVEL.guide.story, () => {
          guide.talking = false;
          guide.met = true;
          intro.phase = 'done';
        });
      } else {
        intro.phase = 'done';
      }
    }
  } else if (intro.phase === 'done') {
    state.intro = null;
    intro.onDone?.();
  }

  setAnim(p, playerAnim);
  tickAnim(p, dt);
  updateCamera(dt);
  updateHud();
}

export function updateCamera(dt) {
  const p = state.player;
  // Đấu trường: neo tâm người chơi (địch đến từ cả 2 phía); màn thường nhìn
  // xa phía trước. Cùng kẹp [0, worldWidth − VIEW_W].
  const targetCamera = LEVEL.arena ? p.x + p.w / 2 - VIEW_W / 2 : p.x - VIEW_W * .34;
  const maxCamera = LEVEL.worldWidth - VIEW_W;
  state.cameraX += (Math.max(0, Math.min(maxCamera, targetCamera)) - state.cameraX) * Math.min(1, dt * 6);
}

// Khe kỹ năng (ENGINE-01): phím K/L (skill1/skill2) -> id kỹ năng của khe đó
// nếu đã sở hữu; hiệu ứng, hồi chiêu do chương (CHAPTER.skills.update).
function updateSkills(dt) {
  const defs = CHAPTER.skills.defs;
  const triggered = new Set(Object.keys(defs).filter(id =>
    defs[id].slot && pressed[defs[id].slot] && state.skills.owned.has(id)));
  CHAPTER.skills.update(dt, triggered);
}

// Rung màn hình (BT-L3 E3): `time` giây, lệch ngang tối đa `amp` px, giảm dần.
// Lần rung mạnh hơn/dài hơn ghi đè lần đang rung. Vẽ ở render/index.js.
export function shakeCamera(time, amp) {
  const shake = state.cameraShake;
  if (shake && shake.time > time && shake.amp >= amp) return;
  state.cameraShake = { time, total: time, amp };
}

function tickCameraShake(dt) {
  const shake = state.cameraShake;
  if (!shake) return;
  shake.time -= dt;
  if (shake.time <= 0) state.cameraShake = null;
}

export function update(dt) {
  if (!state.running || state.paused) return;
  tickCameraShake(dt);
  if (state.won) return;
  if (state.cutscene) {
    LEVEL.cutscene(dt);
    return;
  }
  if (state.intro) {
    updateIntro(dt);
    return;
  }
  tickMessage(dt);
  // NPC dẫn đầu màn nói xong thì mờ dần như NPC thường.
  const guide = state.guide;
  if (guide?.met && guide.fade > 0) guide.fade = Math.max(0, guide.fade - dt / NPC_RULES.fadeTime);

  const p = state.player;
  updatePlayerControl(dt);

  updateAttack();
  if (state.skills) updateSkills(dt);
  pressed.skill1 = false;
  pressed.skill2 = false;
  updateEnemies(dt);
  updateHazards(dt);
  updateProjectiles(dt);
  updateSpawner(dt);
  LEVEL.update?.(dt);
  if (state.cutscene) {
    updatePlayerAnimation(dt);
    updateHud();
    return;
  }

  collectItems(p);
  touchEnemies(p);

  // Câu hỏi chặn đường mở thì dừng game — gặp NPC + sự kiện màn chờ frame sau.
  if (!updateQuizzes(p) && !updateMeetings(p, dt)) LEVEL.events?.(p, dt);

  // Đấu trường không có điểm về đích (kết thúc bằng boss).
  if (!LEVEL.arena && p.x >= state.finishX) {
    if (bossAlive()) {
      p.x = state.finishX - 18;
      p.vx = 0;
      showMessage(CHAPTER.text.bossBlocksFinish);
    } else if (state.itemsCollected < state.items.length) {
      p.x = state.finishX - 18;
      p.vx = 0;
      showMessage(CHAPTER.text.itemsMissing(state.items.length - state.itemsCollected));
    } else if (state.npcs.some(npc => !npc.met)) {
      p.x = state.finishX - 18;
      p.vx = 0;
    } else {
      endGame(true);
    }
  }

  if (p.y > VIEW_H + 96) respawnAfterFall();

  updateCamera(dt);
  updatePlayerAnimation(dt);
  updateHud();
}

// Vật phẩm thu thập: chạm hitbox nhặt (ITEM_HITBOX, lớn hơn hình) thì +200 điểm.
function collectItems(p) {
  state.items.forEach(item => {
    if (item.collected) return;
    const hitbox = { x: item.x - ITEM_HITBOX.w / 2, y: item.y - ITEM_HITBOX.h / 2, w: ITEM_HITBOX.w, h: ITEM_HITBOX.h };
    if (aabb(p, hitbox)) {
      item.collected = true;
      state.itemsCollected += 1;
      state.score += 200;
      playSfx('item');
      showMessage(CHAPTER.text.itemPicked(state.itemsCollected, state.items.length));
    }
  });
}

// Câu hỏi chặn đường (TT-QUIZ-01): chạm mốc `quiz.x` thì mở câu hỏi 1 lần
// (khung hội thoại tự dừng game; trả lời 1 lần — dialogue.js). Mốc gắn NPC:
// tiêu đề "Câu hỏi về <NPC>". Trả về true nếu vừa mở câu hỏi.
function updateQuizzes(p) {
  const quiz = state.quizzes.find(item => !item.done && p.x > item.x);
  if (!quiz) return false;
  quiz.done = true;
  const title = quiz.npc ? `Câu hỏi về ${CHAPTER.dialogues[quiz.npc].name}` : 'Câu hỏi lịch sử';
  openQuiz(CHAPTER.questions[quiz.stt], { title });
  return true;
}

// Gặp NPC (TT-NPC-01 §3.2.3–3.2.4). NPC xếp theo thứ tự gặp; chỉ NPC chưa gặp
// ĐẦU TIÊN có tác dụng: giữ người chơi lại trước NPC (như cổng đích), tới đủ
// gần (talkDistance) thì tạm dừng game và mở hội thoại. Gặp xong NPC mờ dần
// rồi biến mất. Giải cứu (TT-L2-HARD): còn lính vây NPC (enemy `captorOf`)
// sống thì vẫn giữ người chơi nhưng KHÔNG mở hội thoại, và nhắc hạ lính vây
// (tối đa 1 lần mỗi NPC_RESCUE.hintInterval giây). Trả về true nếu vừa mở hội thoại.
function updateMeetings(p, dt) {
  if (!state.npcs.length) return false;
  state.npcs.forEach(npc => {
    if (npc.met && npc.fade > 0) npc.fade = Math.max(0, npc.fade - dt / NPC_RULES.fadeTime);
  });
  state.rescueHintTimer = Math.max(0, (state.rescueHintTimer || 0) - dt);

  const npc = state.npcs.find(item => !item.met);
  if (!npc) return false;
  // NPC to (voi, nhóm người) khai báo `holdGap` riêng trong sprites.npcs để
  // người chơi đứng ngoài thân; khoảng nói chuyện dời theo cùng độ lệch.
  const holdGap = CHAPTER.sprites.npcs?.[npc.id]?.holdGap ?? NPC_RULES.holdGap;
  const talkDistance = NPC_RULES.talkDistance + holdGap - NPC_RULES.holdGap;
  const front = p.x + p.w;
  if (front > npc.centerX - holdGap) {
    p.x = npc.centerX - holdGap - p.w;
    p.vx = 0;
  }
  const distance = npc.centerX - (p.x + p.w);
  // Quân vây = enemy hoặc hazard (thợ săn…) có `captorOf` còn sống.
  const captive = [...state.enemies, ...state.hazards].some(item => item.captorOf === npc.id && item.alive);
  if (captive && distance <= NPC_RESCUE.hintRange && state.rescueHintTimer <= 0) {
    state.rescueHintTimer = NPC_RESCUE.hintInterval;
    showMessage(CHAPTER.text.rescueHint(CHAPTER.dialogues[npc.id].name), 2400);
  }
  if (!captive && distance <= talkDistance) {
    openNpcDialogue(npc, () => { npc.met = true; });
    return true;
  }
  return false;
}
