// Định nghĩa chương Mai Hắc Đế (chương 5) cho engine màn chơi. Hợp đồng các
// trường: engine/chapter.js. Màn 1 thật (MHD-L1: gánh cống phẩm, cứu dân phu,
// chướng ngại xáo, mini-boss quan thu thuế); màn 2 thật (MHD-L2: 3 NPC khoá theo
// sách); màn 3 thật (MHD-L3: trận Quang Sở Khách, kỹ năng, cutscene).

import { CHUNK_W } from '../../engine/config.js';
import { state } from '../../engine/state.js';
import {
  SPRITE_ROOT, SPRITE_MANIFEST_FILE, MAP_ROOT, MAP_MANIFEST_FILE, BORROWED_MAPS, TILES, FAR_HILLS, PORTRAITS, LEVEL_SPRITES, LEVEL_URLS,
  LEVEL1_CHUNKS, LEVEL1_ZONES, LEVEL1_FINISH_X, FINISH_GATE, GUIDE_LOCAL_X, LEVEL2_CHUNKS, LEVEL2_ZONES, LEVEL2_FINISH_X, ARENA, LEVEL3_ZONES,
  BOSS_TEXT,
  OBSTACLE_TYPES, QUIZ_STELE_ID, MAP_PROPS_IN_GAME, HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES, NPC_SPRITES,
  ITEM, PICKUPS, REWARD_NAMES, TEXT, CARRY, RESCUE
} from './config.js';
import { QUESTIONS } from './questions-data.js';
import { NPC_DIALOGUES, CHAPTER_END, STORY_MHD_INTRO } from './dialogue-data.js';
import { SFX, MUSIC, MUSIC_FILES } from './audio-data.js';
import { level1Content, level1Events, burdenAttackAtCart, ENGINE_TEST_HOOKS, ENGINE_TEST_KINDS } from './level1.js';
import { level2Content, level2Events } from './level2.js';
import { level3Content } from './level3.js';
import {
  updateBattle, updateCutscene, ENEMY_KINDS, updateBossHud, dropCarry, onThrownHit, onThrownLand, dropHeal, onAttackWindow
} from './boss.js';
import { MHD_SKILLS } from './skills.js';
import { DRAW_LAYERS } from './render-extras.js';

// Layout thử ?layout=engine dùng móc thử của MHD-ENGINE, màn thật dùng móc thật.
const testing = () => state.layoutTest === 'engine';

export const MAI_HAC_DE = {
  id: 5,
  key: 'mhd',
  spriteRoot: SPRITE_ROOT,
  spriteManifest: SPRITE_MANIFEST_FILE,
  mapRoot: MAP_ROOT,
  mapManifest: MAP_MANIFEST_FILE,
  borrowedMaps: BORROWED_MAPS,
  tiles: TILES,
  farHills: FAR_HILLS,
  mapProps: MAP_PROPS_IN_GAME,
  domSprites: PORTRAITS,
  sprites: {
    obstacles: OBSTACLE_TYPES,
    hazards: HAZARD_SPRITES,
    enemies: ENEMY_SPRITES,
    projectiles: PROJECTILE_SPRITES,
    npcs: NPC_SPRITES
  },
  item: ITEM,
  pickups: PICKUPS,
  carry: CARRY,
  rescue: RESCUE,
  skills: MHD_SKILLS,
  enemyKinds: { ...ENGINE_TEST_KINDS, ...ENEMY_KINDS },
  // Câu hướng dẫn đoạn gánh màn 1 (level1Events); tiến trình trận
  // boss màn 3 (level3Content).
  stateFields: () => ({ tipIndex: 0, battle: null }),
  hooks: {
    // Đang gánh mà bấm Đánh: màn thật đập sọt ở xe cống đầu tiên (level1.js).
    onBurdenAttack: p => (testing() ? ENGINE_TEST_HOOKS.onBurdenAttack(p) : burdenAttackAtCart(p)),
    // Hũ dầu: layout thử màn 1 dùng móc thử; màn 3 đốt khiên vệ sĩ (boss.js).
    dropCarry: target => (testing() ? ENGINE_TEST_HOOKS.dropCarry(target) : dropCarry(target)),
    onThrownHit: (thrown, target) => (testing() ? ENGINE_TEST_HOOKS.onThrownHit(thrown, target) : onThrownHit(thrown, target)),
    onThrownLand: thrown => { if (!testing()) onThrownLand(thrown); },
    // Bình máu, tóe lửa khiên, ô boss: chỉ có tác dụng khi state.battle (màn 3).
    dropHeal,
    onAttackWindow,
    updateHud: updateBossHud,
    draw: DRAW_LAYERS
  },
  quizStele: QUIZ_STELE_ID,
  questions: QUESTIONS,
  dialogues: NPC_DIALOGUES,
  rewards: REWARD_NAMES,
  chapterEnd: CHAPTER_END,
  // Tên trúng ở màn 3 báo câu riêng; câu khác dùng chung.
  text: { ...TEXT, get projectileHit() { return state.battle ? BOSS_TEXT.boltHit : TEXT.projectileHit; } },
  audio: { sfx: SFX, music: MUSIC, musicFiles: MUSIC_FILES },
  // Tên màn: MHD-00 §5.1 (duyệt 07/11/2026); câu mô tả màn 1 duyệt 08/11/2026 (MHD-L1 Q1).
  levels: {
    1: {
      id: 1, title: 'Màn 1: Gánh cống Hoan Châu', url: LEVEL_URLS[1],
      chunks: LEVEL1_CHUNKS, worldWidth: CHUNK_W * LEVEL1_CHUNKS, zones: LEVEL1_ZONES, finishX: LEVEL1_FINISH_X, gate: FINISH_GATE,
      sprites: LEVEL_SPRITES[1],
      content: level1Content,
      events: level1Events,
      // Vào màn đang gánh cống phẩm (MHD-ENGINE E4, số mặc định engine BURDEN).
      burden: {},
      // Mai Thúc Loan chờ người chơi ở đầu màn (thoại MHD-00 §5.2, duyệt 08/11/2026).
      guide: { npc: 'maiThucLoan', localX: GUIDE_LOCAL_X, story: STORY_MHD_INTRO },
      introMessage: 'Màn 1: Gánh cống Hoan Châu — Năm 713, nhà Đường đô hộ nước ta. Hãy cùng Mai Thúc Loan phá đoàn cống phẩm, thu đủ 5 Quyển Sách Tinh Hoa.',
      introMessageTime: 4200,
      // Layout thử cơ chế MHD-ENGINE: ?layout=engine.
      testLayout: 'engine',
      summary: state => `Bạn thu thập ${state.itemsCollected}/5 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    2: {
      id: 2, title: 'Màn 2: Dựng cờ Vạn An', url: LEVEL_URLS[2],
      chunks: LEVEL2_CHUNKS, worldWidth: CHUNK_W * LEVEL2_CHUNKS, zones: LEVEL2_ZONES, finishX: LEVEL2_FINISH_X, gate: null,
      sprites: LEVEL_SPRITES[2],
      content: level2Content,
      events: level2Events,
      introMessage: 'Màn 2: Dựng cờ Vạn An',
      summary: state => `Bạn thu thập ${state.itemsCollected}/10 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    3: {
      id: 3, title: 'Màn 3: Công phá Tống Bình', url: LEVEL_URLS[3],
      chunks: 1, worldWidth: ARENA.width, zones: LEVEL3_ZONES, finishX: ARENA.width, arena: true,
      playerStartX: ARENA.playerStartX, gate: null,
      sprites: LEVEL_SPRITES[3],
      content: level3Content,
      update: updateBattle,
      cutscene: updateCutscene,
      introMessage: 'Màn 3: Công phá Tống Bình',
      // Layout thử kỹ năng: ?layout=skills (vào thẳng GĐ 2; thêm ?debug=1 để đủ phần thưởng).
      testLayout: 'skills',
      skills: true,
      summary: state => `Bạn đạt ${state.score} điểm.`
    }
  }
};
