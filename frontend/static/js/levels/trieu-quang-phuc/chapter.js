// Định nghĩa chương Triệu Việt Vương (chương 4) cho engine màn chơi. Hợp đồng
// các trường: engine/chapter.js. 3 màn khung (TQP-SKELETON) bằng asset chương 3
// (config.js) — chưa có NPC, kỹ năng, boss.

import { CHUNK_W } from '../../engine/config.js';
import {
  SPRITE_ROOT, SPRITE_MANIFEST_FILE, MAP_ROOT, MAP_MANIFEST_FILE, BORROWED_MAPS, TILES, FAR_HILLS, PORTRAITS, LEVEL_SPRITES, LEVEL_URLS,
  LEVEL1_CHUNKS, LEVEL1_ZONES, LEVEL1_FINISH_X, LEVEL2_CHUNKS, LEVEL2_ZONES, LEVEL2_FINISH_X, ARENA, LEVEL3_ZONES,
  OBSTACLE_TYPES, QUIZ_STELE_ID, MAP_PROPS_IN_GAME, HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES, NPC_SPRITES,
  ITEM, PICKUPS, REWARD_NAMES, TEXT
} from './config.js';
import { QUESTIONS } from './questions-data.js';
import { NPC_DIALOGUES, CHAPTER_END } from './dialogue-data.js';
import { SFX, MUSIC, MUSIC_FILES } from './audio-data.js';
import { level1Content } from './level1.js';
import { level2Content } from './level2.js';
import { level3Content, updateLevel3 } from './level3.js';

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
  // Tên màn: TQP-00 §5.1 (duyệt 04/11/2026); câu mô tả màn 1 còn chờ duyệt.
  levels: {
    1: {
      id: 1, title: 'Màn 1: Tuổi trẻ rèn luyện', url: LEVEL_URLS[1],
      chunks: LEVEL1_CHUNKS, worldWidth: CHUNK_W * LEVEL1_CHUNKS, zones: LEVEL1_ZONES, finishX: LEVEL1_FINISH_X, gate: null,
      sprites: LEVEL_SPRITES[1],
      content: level1Content,
      introMessage: 'Màn 1: Tuổi trẻ rèn luyện',
      summary: state => `Bạn thu thập ${state.itemsCollected}/5 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    2: {
      id: 2, title: 'Màn 2: Hiền tài Dạ Trạch', url: LEVEL_URLS[2],
      chunks: LEVEL2_CHUNKS, worldWidth: CHUNK_W * LEVEL2_CHUNKS, zones: LEVEL2_ZONES, finishX: LEVEL2_FINISH_X, gate: null,
      sprites: LEVEL_SPRITES[2],
      content: level2Content,
      introMessage: 'Màn 2: Hiền tài Dạ Trạch',
      summary: state => `Bạn đạt ${state.score} điểm.`
    },
    3: {
      id: 3, title: 'Màn 3: Đại phá Dương Sàn', url: LEVEL_URLS[3],
      chunks: 1, worldWidth: ARENA.width, zones: LEVEL3_ZONES, finishX: ARENA.width, arena: true,
      playerStartX: ARENA.playerStartX, gate: null,
      sprites: LEVEL_SPRITES[3],
      content: level3Content,
      update: updateLevel3,
      introMessage: 'Màn 3: Đại phá Dương Sàn',
      summary: state => `Bạn đạt ${state.score} điểm.`
    }
  }
};
