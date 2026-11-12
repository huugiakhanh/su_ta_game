// Định nghĩa chương Triệu Việt Vương (chương 4) cho engine màn chơi. Hợp đồng
// các trường: engine/chapter.js. Màn 1 thật (TQP-L1: khu rèn luyện, chướng ngại
// xáo, mini-boss đội trưởng giáo dài); màn 2 thật (TQP-L2: 3 NPC khoá theo sách,
// ngày -> đêm, bụi lau ẩn nấp); màn 3 thật (TQP-L3: boss Dương Sàn 3 giai đoạn,
// 3 kỹ năng, cutscene).

import { CHUNK_W } from '../../engine/config.js';
import {
  SPRITE_ROOT, SPRITE_MANIFEST_FILE, MAP_ROOT, MAP_MANIFEST_FILE, BORROWED_MAPS, TILES, FAR_HILLS, PORTRAITS, LEVEL_SPRITES, LEVEL_URLS,
  LEVEL1_CHUNKS, LEVEL1_ZONES, LEVEL1_FINISH_X, FINISH_GATE, GUIDE_LOCAL_X, LEVEL2_CHUNKS, LEVEL2_ZONES, LEVEL2_FINISH_X, LEVEL2_FAR_HILLS, LEVEL2_TILES, ARENA, LEVEL3_ZONES,
  LEVEL3_FAR_HILLS, LEVEL3_TILES,
  OBSTACLE_TYPES, QUIZ_STELE_ID, MAP_PROPS_IN_GAME, HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES, NPC_SPRITES,
  ITEM, PICKUPS, REWARD_NAMES, TEXT
} from './config.js';
import { QUESTIONS } from './questions-data.js';
import { NPC_DIALOGUES, CHAPTER_END, STORY_TQP_INTRO } from './dialogue-data.js';
import { SFX, MUSIC, MUSIC_FILES } from './audio-data.js';
import { level1Content, level1Events } from './level1.js';
import { level2Content, level2Events } from './level2.js';
import { level3Content } from './level3.js';
import { updateBattle, updateCutscene, ENEMY_KINDS, dropHeal, updateBossHud, battleDebugEntities } from './boss.js';
import { TQP_SKILLS } from './skills.js';
import { DRAW_LAYERS } from './render-extras.js';

export const TRIEU_QUANG_PHUC = {
  id: 4,
  key: 'tqp',
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
  quizStele: QUIZ_STELE_ID,
  questions: QUESTIONS,
  dialogues: NPC_DIALOGUES,
  rewards: REWARD_NAMES,
  chapterEnd: CHAPTER_END,
  text: TEXT,
  audio: { sfx: SFX, music: MUSIC, musicFiles: MUSIC_FILES },
  // Đòn bổ từ trên (TQP-ENGINE E5): bổ chéo về trước — rơi `speed`, lao ngang
  // `forward` px/s (người dùng chơi thử 04/11: rơi thẳng xuống quá nhanh). Đánh úp
  // khi ẩn nấp ×2 (E7). DESIGN_BASELINE.
  plunge: { speed: 280, forward: 260 },
  stealth: { ambush: 2 },
  skills: TQP_SKILLS,
  enemyKinds: ENEMY_KINDS,
  // Câu hướng dẫn khu rèn luyện màn 1 (level1Events); giây từ lúc
  // rồng vàng hiện ở màn 2 (null = chưa hiện — level2Events); tiến trình trận
  // boss màn 3 (level3Content).
  stateFields: () => ({ tipIndex: 0, dragonTime: null, battle: null }),
  hooks: {
    // Bình máu rơi khi hạ địch: chỉ màn 3, theo tỉ lệ HEAL_DROP (boss.js dropHeal).
    dropHeal,
    updateHud: updateBossHud,
    debugEntities: battleDebugEntities,
    draw: DRAW_LAYERS
  },
  // Tên màn + thông báo đầu màn 1: TQP-00 §5.1 (duyệt 04/11/2026 — TQP-L1 Q1).
  levels: {
    1: {
      id: 1, title: 'Màn 1: Tuổi trẻ rèn luyện', url: LEVEL_URLS[1],
      chunks: LEVEL1_CHUNKS, worldWidth: CHUNK_W * LEVEL1_CHUNKS, zones: LEVEL1_ZONES, finishX: LEVEL1_FINISH_X, gate: FINISH_GATE,
      sprites: LEVEL_SPRITES[1],
      content: level1Content,
      events: level1Events,
      // Triệu Quang Phục chờ người chơi ở đầu màn (thoại TQP-00 §5.2, duyệt 04/11/2026).
      guide: { npc: 'tqp', localX: GUIDE_LOCAL_X, story: STORY_TQP_INTRO },
      introMessage: 'Màn 1: Tuổi trẻ rèn luyện — Giữa thế kỷ 6, quân Lương đô hộ Giao Châu. Hãy cùng Triệu Quang Phục rèn võ nghệ ở Chu Diên, thu đủ 5 Quyển Sách Tinh Hoa.',
      introMessageTime: 4200,
      // Layout thử cơ chế TQP-ENGINE: ?layout=engine.
      testLayout: 'engine',
      summary: state => `Bạn thu thập ${state.itemsCollected}/5 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    2: {
      id: 2, title: 'Màn 2: Hiền tài Dạ Trạch', url: LEVEL_URLS[2],
      chunks: LEVEL2_CHUNKS, worldWidth: CHUNK_W * LEVEL2_CHUNKS, zones: LEVEL2_ZONES, finishX: LEVEL2_FINISH_X, gate: null,
      farHills: LEVEL2_FAR_HILLS,
      // Nước đầm xanh rêu riêng màn 2 (engine ghi đè CHAPTER.tiles).
      tiles: LEVEL2_TILES,
      sprites: LEVEL_SPRITES[2],
      content: level2Content,
      events: level2Events,
      // Tên màn TQP-00 §5.1 (duyệt 04/11/2026 — TQP-00 mục 7).
      introMessage: 'Màn 2: Hiền tài Dạ Trạch',
      summary: state => `Bạn thu thập ${state.itemsCollected}/10 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    3: {
      id: 3, title: 'Màn 3: Đại phá Dương Sàn', url: LEVEL_URLS[3],
      chunks: 1, worldWidth: ARENA.width, zones: LEVEL3_ZONES, finishX: ARENA.width, arena: true,
      playerStartX: ARENA.playerStartX, gate: null,
      farHills: LEVEL3_FAR_HILLS,
      // Nước đầm xanh rêu (GĐ 3 đoạn giữa hoá nước).
      tiles: LEVEL3_TILES,
      sprites: LEVEL_SPRITES[3],
      content: level3Content,
      update: updateBattle,
      cutscene: updateCutscene,
      // Tên màn TQP-00 §5.1 (duyệt 04/11/2026 — TQP-00 mục 7).
      introMessage: 'Màn 3: Đại phá Dương Sàn',
      // Layout thử kỹ năng: ?layout=skills (boss lún sẵn + lính đánh thuê lặp).
      testLayout: 'skills',
      skills: true,
      summary: state => `Bạn đạt ${state.score} điểm.`
    }
  }
};
