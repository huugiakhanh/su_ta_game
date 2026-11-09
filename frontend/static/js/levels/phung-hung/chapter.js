// Định nghĩa chương Phùng Hưng (chương 6) cho engine màn chơi. Hợp đồng các
// trường: engine/chapter.js. Màn 1, 2 thật (PH-L1, PH-L2); màn 3 còn khung (PH-SKELETON).

import { CHUNK_W } from '../../engine/config.js';
import {
  SPRITE_ROOT, SPRITE_MANIFEST_FILE, MAP_ROOT, MAP_MANIFEST_FILE, BORROWED_MAPS, TILES, FAR_HILLS, PORTRAITS, LEVEL_SPRITES, LEVEL_URLS,
  LEVEL1_CHUNKS, LEVEL1_ZONES, LEVEL1_FINISH_X, FINISH_GATE, GUIDE_LOCAL_X, LEVEL2_CHUNKS, LEVEL2_ZONES, LEVEL2_FINISH_X, ARENA, LEVEL3_ZONES,
  OBSTACLE_TYPES, QUIZ_STELE_ID, MAP_PROPS_IN_GAME, HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES, NPC_SPRITES,
  ITEM, PICKUPS, REWARD_NAMES, TEXT, EXTRA_ITEMS
} from './config.js';
import { QUESTIONS } from './questions-data.js';
import { NPC_DIALOGUES, CHAPTER_END, STORY_PH_INTRO } from './dialogue-data.js';
import { SFX, MUSIC, MUSIC_FILES } from './audio-data.js';
import { level1Content, level1Events, ENEMY_KINDS, onPushHit } from './level1.js';
import { level2Content, level2Events } from './level2.js';
import { level3Content, updateLevel3 } from './level3.js';

export const PHUNG_HUNG = {
  id: 6,
  key: 'ph',
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
  extraItems: EXTRA_ITEMS,
  // Đòn gồng (PH-ENGINE E1, số mặc định engine CHARGE).
  charge: {},
  enemyKinds: ENEMY_KINDS,
  stateFields: () => ({ restUsed: false, tipIndex: 0 }),
  hooks: { onPushHit },
  quizStele: QUIZ_STELE_ID,
  questions: QUESTIONS,
  dialogues: NPC_DIALOGUES,
  rewards: REWARD_NAMES,
  chapterEnd: CHAPTER_END,
  text: TEXT,
  audio: { sfx: SFX, music: MUSIC, musicFiles: MUSIC_FILES },
  // Tên màn + câu mô tả màn 1: PH-00 §5.1 (duyệt 09/11/2026).
  levels: {
    1: {
      id: 1, title: 'Màn 1: Trai tráng Đường Lâm', url: LEVEL_URLS[1],
      chunks: LEVEL1_CHUNKS, worldWidth: CHUNK_W * LEVEL1_CHUNKS, zones: LEVEL1_ZONES, finishX: LEVEL1_FINISH_X, gate: FINISH_GATE,
      sprites: LEVEL_SPRITES[1],
      content: level1Content,
      events: level1Events,
      // Phùng Hưng chờ người chơi ở đầu màn (thoại PH-00 §5.1).
      guide: { npc: 'phungHung', localX: GUIDE_LOCAL_X, story: STORY_PH_INTRO },
      introMessage: 'Màn 1: Trai tráng Đường Lâm — Nửa cuối thế kỷ 8, nhà Đường đô hộ nước ta. Hãy cùng Phùng Hưng bảo vệ dân làng, thu đủ 5 Quyển Sách Tinh Hoa.',
      introMessageTime: 4200,
      // Layout thử cơ chế PH-ENGINE: ?layout=engine.
      testLayout: 'engine',
      summary: state => `Bạn thu thập ${state.itemsCollected}/5 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    2: {
      id: 2, title: 'Màn 2: Tụ nghĩa chiêu hiền', url: LEVEL_URLS[2],
      chunks: LEVEL2_CHUNKS, worldWidth: CHUNK_W * LEVEL2_CHUNKS, zones: LEVEL2_ZONES, finishX: LEVEL2_FINISH_X, gate: null,
      sprites: LEVEL_SPRITES[2],
      content: level2Content,
      events: level2Events,
      introMessage: 'Màn 2: Tụ nghĩa chiêu hiền',
      summary: state => `Bạn thu thập ${state.itemsCollected}/10 Quyển Sách Tinh Hoa, ${state.extraCollected.weapon || 0}/3 Vũ Khí Thô Sơ và đạt ${state.score} điểm.`
    },
    3: {
      id: 3, title: 'Màn 3: Vây phủ Tống Bình', url: LEVEL_URLS[3],
      chunks: 1, worldWidth: ARENA.width, zones: LEVEL3_ZONES, finishX: ARENA.width, arena: true,
      playerStartX: ARENA.playerStartX, gate: null,
      sprites: LEVEL_SPRITES[3],
      content: level3Content,
      update: updateLevel3,
      introMessage: 'Màn 3: Vây phủ Tống Bình',
      summary: state => `Bạn đạt ${state.score} điểm.`
    }
  }
};
