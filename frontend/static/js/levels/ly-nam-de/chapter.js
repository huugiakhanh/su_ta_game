// Định nghĩa chương Lý Nam Đế (chương 3) cho engine màn chơi. Hợp đồng các
// trường: engine/chapter.js. Màn 1 (LND-L1), màn 2 (LND-L2: 3 NPC chiêu mộ),
// màn 3 (LND-L3: boss Tiêu Tư + 3 kỹ năng + cutscene).

import { CHUNK_W } from '../../engine/config.js';
import { state } from '../../engine/state.js';
import {
  SPRITE_ROOT, SPRITE_MANIFEST_FILE, MAP_ROOT, MAP_MANIFEST_FILE, BORROWED_MAPS, TILES, FAR_HILLS, PORTRAITS, LEVEL_SPRITES, LEVEL_URLS,
  LEVEL1_CHUNKS, LEVEL1_ZONES, LEVEL1_FINISH_X, FINISH_GATE, GUIDE_LOCAL_X, LEVEL2_CHUNKS, LEVEL2_ZONES, LEVEL2_FINISH_X, LEVEL2_FAR_HILLS, ARENA, LEVEL3_ZONES,
  OBSTACLE_TYPES, QUIZ_STELE_ID, MAP_PROPS_IN_GAME, HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES, NPC_SPRITES,
  ITEM, PICKUPS, REWARD_NAMES, TEXT
} from './config.js';
import { QUESTIONS } from './questions-data.js';
import { NPC_DIALOGUES, CHAPTER_END, STORY_LY_BI_INTRO } from './dialogue-data.js';
import { SFX, MUSIC, MUSIC_FILES } from './audio-data.js';
import { level1Content } from './level1.js';
import { level2Content } from './level2.js';
import { level3Content } from './level3.js';
import { updateBattle, updateCutscene, ENEMY_KINDS, updateBossHud, battleDebugEntities, dropHeal } from './boss.js';
import { LND_SKILLS, skillDebugEntities } from './skills.js';
import { DRAW_LAYERS } from './render-extras.js';

export const LY_NAM_DE = {
  id: 3,
  key: 'lnd',
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
  skills: LND_SKILLS,
  enemyKinds: ENEMY_KINDS,
  // Tiến trình trận boss màn 3 (level3Content).
  stateFields: () => ({ battle: null }),
  hooks: {
    // Bình máu rơi khi hạ địch (engine LND-ENGINE E4b): layout thử `?layout=engine`
    // luôn rơi; màn 3 theo tỉ lệ + buff Lương thảo dồi dào (boss.js dropHeal).
    dropHeal: target => state.layoutTest === 'engine' || dropHeal(target),
    updateHud: updateBossHud,
    debugEntities: () => [...battleDebugEntities(), ...skillDebugEntities()],
    draw: DRAW_LAYERS
  },
  // Tên màn + thông báo đầu màn: LND-00 §5.1 (nguyên văn, duyệt 31/10/2026).
  levels: {
    1: {
      id: 1, title: 'Màn 1: Từ quan chiêu binh', url: LEVEL_URLS[1],
      chunks: LEVEL1_CHUNKS, worldWidth: CHUNK_W * LEVEL1_CHUNKS, zones: LEVEL1_ZONES, finishX: LEVEL1_FINISH_X, gate: FINISH_GATE,
      sprites: LEVEL_SPRITES[1],
      content: level1Content,
      // Lý Bí chờ người chơi ở đầu màn (thoại LND-00 §5.2, duyệt 31/10/2026).
      guide: { npc: 'lyBi', localX: GUIDE_LOCAL_X, story: STORY_LY_BI_INTRO },
      introMessage: 'Màn 1: Từ quan chiêu binh — Đầu thế kỷ 6, thứ sử Tiêu Tư nhà Lương tàn bạo, tham nhũng. Hãy theo Lý Bí tập hợp lực lượng, thu đủ 5 Quyển Sách Tinh Hoa.',
      introMessageTime: 4200,
      // Layout thử cơ chế LND-ENGINE: ?layout=engine.
      testLayout: 'engine',
      summary: state => `Bạn thu thập ${state.itemsCollected}/5 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    2: {
      id: 2, title: 'Màn 2: Chiêu mộ hiền tài', url: LEVEL_URLS[2],
      chunks: LEVEL2_CHUNKS, worldWidth: CHUNK_W * LEVEL2_CHUNKS, zones: LEVEL2_ZONES, finishX: LEVEL2_FINISH_X, gate: null,
      farHills: LEVEL2_FAR_HILLS,
      sprites: LEVEL_SPRITES[2],
      content: level2Content,
      introMessage: 'Màn 2: Chiêu mộ hiền tài',
      summary: state => `Bạn thu thập ${state.itemsCollected}/10 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    3: {
      id: 3, title: 'Màn 3: Công phá thành Long Biên', url: LEVEL_URLS[3],
      chunks: 1, worldWidth: ARENA.width, zones: LEVEL3_ZONES, finishX: ARENA.width, arena: true,
      playerStartX: ARENA.playerStartX, gate: null,
      sprites: LEVEL_SPRITES[3],
      content: level3Content,
      update: updateBattle,
      cutscene: updateCutscene,
      introMessage: 'Màn 3: Công phá thành Long Biên',
      // Layout thử kỹ năng: ?layout=skills (bao cát + cận vệ + xe hoả công lặp).
      testLayout: 'skills',
      skills: true,
      summary: state => `Bạn đạt ${state.score} điểm.`
    }
  }
};
