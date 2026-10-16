// Định nghĩa chương Trưng Trắc (chương 1) cho engine màn chơi (ENGINE-01).
// Hợp đồng các trường: engine/chapter.js. Gồm 3 màn: Vượt ải, Chiêu mộ hiền
// tài, Trận Luy Lâu (boss Tô Định).

import { CHUNK_W } from '../../engine/config.js';
import {
  SPRITE_ROOT, SPRITE_MANIFEST_FILE, MAP_ROOT, MAP_MANIFEST_FILE, TILES, FAR_HILLS, PORTRAITS, LEVEL_SPRITES, LEVEL_URLS,
  ZONES, LEVEL_CHUNKS, LEVEL_WORLD_WIDTH, FINISH_X, FINISH_GATE, GUIDE_LOCAL_X, ITEM,
  LEVEL2_CHUNKS, LEVEL2_ZONES, LEVEL2_FINISH_X, ARENA, LEVEL3_ZONES, VICTORY_FLAG,
  OBSTACLE_TYPES, QUIZ_STELE_ID, MAP_PROPS_IN_GAME, HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES, NPC_SPRITES,
  REWARD_NAMES, TEXT
} from './config.js';
import { QUESTIONS } from './questions-data.js';
import { NPC_DIALOGUES, STORY_TRUNG_TRAC_INTRO, CHAPTER_END } from './dialogue-data.js';
import { SFX, MUSIC, MUSIC_FILES } from './audio-data.js';
import { level1Content, level1Events } from './level1.js';
import { level2Content, level2Events } from './level2.js';
import { level3Content } from './level3.js';
import {
  updateBattle, updateCutscene, ENEMY_KINDS, reflectJarsInBox, keepDashingThroughChariot, updateBossHud,
  battleDebugEntities
} from './boss.js';
import { TT_SKILLS, skillDebugEntities } from './skills.js';
import { DRAW_LAYERS } from './render-extras.js';

export const TRUNG_TRAC = {
  id: 1,
  key: 'tt',
  spriteRoot: SPRITE_ROOT,
  spriteManifest: SPRITE_MANIFEST_FILE,
  mapRoot: MAP_ROOT,
  mapManifest: MAP_MANIFEST_FILE,
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
  quizStele: QUIZ_STELE_ID,
  questions: QUESTIONS,
  dialogues: NPC_DIALOGUES,
  rewards: REWARD_NAMES,
  chapterEnd: CHAPTER_END,
  text: TEXT,
  audio: { sfx: SFX, music: MUSIC, musicFiles: MUSIC_FILES },
  skills: TT_SKILLS,
  enemyKinds: ENEMY_KINDS,
  // Trường state riêng chương: hũ dầu đang bay, đám lửa, mũi tên kỹ năng, mưa
  // tên trên thành, tiến trình trận (màn 3); cờ nghỉ chân (màn 1).
  stateFields: () => ({ jars: [], fires: [], arrows: [], wallArrows: [], battle: null, restUsed: false }),
  hooks: {
    updateHud: updateBossHud,
    onAttackWindow: reflectJarsInBox,
    keepDashing: keepDashingThroughChariot,
    debugEntities: () => [...battleDebugEntities(), ...skillDebugEntities()],
    draw: DRAW_LAYERS
  },
  levels: {
    1: {
      id: 1, title: 'Màn 1: Vượt ải', url: LEVEL_URLS[1],
      chunks: LEVEL_CHUNKS, worldWidth: LEVEL_WORLD_WIDTH, zones: ZONES, finishX: FINISH_X, gate: FINISH_GATE,
      sprites: LEVEL_SPRITES[1],
      content: level1Content,
      events: level1Events,
      // Trưng Trắc chờ người chơi ở đầu màn (TT-HERO-01).
      guide: { npc: 'trungTrac', localX: GUIDE_LOCAL_X, story: STORY_TRUNG_TRAC_INTRO },
      introMessage: 'Thu thập 5 cuốn sách, vượt chướng ngại và hạ kiệu quan.',
      testLayout: 'p2',
      summary: state => `Bạn thu thập ${state.itemsCollected}/5 sách và đạt ${state.score} điểm.`
    },
    2: {
      id: 2, title: 'Màn 2: Chiêu mộ hiền tài', url: LEVEL_URLS[2],
      chunks: LEVEL2_CHUNKS, worldWidth: CHUNK_W * LEVEL2_CHUNKS, zones: LEVEL2_ZONES, finishX: LEVEL2_FINISH_X, gate: null,
      sprites: LEVEL_SPRITES[2],
      content: level2Content,
      events: level2Events,
      introMessage: 'Màn 2: Chiêu mộ hiền tài',
      summary: state => `Bạn đã gặp đủ ${state.npcs.length} người tài và đạt ${state.score} điểm.`
    },
    3: {
      id: 3, title: 'Màn 3: Trận Luy Lâu', url: LEVEL_URLS[3],
      chunks: 1, worldWidth: ARENA.width, zones: LEVEL3_ZONES, finishX: ARENA.width, arena: true,
      playerStartX: ARENA.playerStartX,
      gate: { closed: FINISH_GATE.closed, open: FINISH_GATE.open, worldX: ARENA.gateX, flag: VICTORY_FLAG },
      sprites: LEVEL_SPRITES[3],
      content: level3Content,
      update: updateBattle,
      cutscene: updateCutscene,
      // TT-BOSS-01 mục 5.1 (nguyên văn).
      introMessage: 'Tô Định núp sau chiến xa bọc khiên. Hãy dụ xe đâm vào cột đá, hoặc chém trả hũ dầu!',
      introMessageTime: 4200,
      testLayout: 'skills',
      skills: true,
      summary: state => `Bạn thu thập ${state.itemsCollected}/5 sách và đạt ${state.score} điểm.`
    }
  }
};
