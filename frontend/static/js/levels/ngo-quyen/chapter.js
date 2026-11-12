// Định nghĩa chương Ngô Quyền (chương 7) cho engine màn chơi. Hợp đồng các
// trường: engine/chapter.js. Màn 1 (NQ-L1), màn 2 (NQ-L2), màn 3 trận Bạch Đằng (NQ-L3).

import { CHUNK_W } from '../../engine/config.js';
import {
  SPRITE_ROOT, SPRITE_MANIFEST_FILE, MAP_ROOT, MAP_MANIFEST_FILE, BORROWED_MAPS, TILES, FAR_HILLS, PORTRAITS, LEVEL_SPRITES, LEVEL_URLS,
  LEVEL1_CHUNKS, LEVEL1_ZONES, LEVEL1_FINISH_X, FINISH_GATE, GUIDE_LOCAL_X, CARRY, PLUNGE, LEVEL2_CHUNKS, LEVEL2_ZONES, LEVEL2_FINISH_X, ARENA, LEVEL3_ZONES,
  OBSTACLE_TYPES, QUIZ_STELE_ID, MAP_PROPS_IN_GAME, HAZARD_SPRITES, ENEMY_SPRITES, PROJECTILE_SPRITES, NPC_SPRITES,
  ITEM, PICKUPS, REWARD_NAMES, TEXT, STAKES, BURDEN_ANIMS, LEVEL2_TIDE, LEVEL2_STAKES_REQUIRED, LEVEL3_TIDE, BOSS_TEXT
} from './config.js';
import { state } from '../../engine/state.js';
import { QUESTIONS } from './questions-data.js';
import { NPC_DIALOGUES, CHAPTER_END, STORY_NQ_INTRO } from './dialogue-data.js';
import { SFX, MUSIC, MUSIC_FILES } from './audio-data.js';
import { level1Content, level1Events, dropCarry } from './level1.js';
import { DRAW_LAYERS } from './render-extras.js';
import { level2Content, level2Events } from './level2.js';
import { level3Content } from './level3.js';
import {
  updateBattle, updateCutscene, ENEMY_KINDS as BATTLE_KINDS, updateBossHud, onThrownHit, onHazardBroken, dropHeal
} from './boss.js';
import { NQ_SKILLS } from './skills.js';

export const NGO_QUYEN = {
  id: 7,
  key: 'nq',
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
  // Mốc cắm cọc (NQ-ENGINE E5).
  stakes: STAKES,
  // Vác cọc phát strip riêng stake_idle/stake_run (NQ-L2 L2-E1).
  burdenAnims: BURDEN_ANIMS,
  // Lao ném (màn 1, lính vùng Đại La rơi) + đòn bổ hạ Kiều Công Tiễn (Q1).
  carry: CARRY,
  plunge: PLUNGE,
  stateFields: () => ({ restUsed: false, tipIndex: 0, javelinHintShown: false, kctTalked: false }),
  skills: NQ_SKILLS,
  enemyKinds: BATTLE_KINDS,
  hooks: { dropCarry, onThrownHit, onHazardBroken, dropHeal, updateHud: updateBossHud, draw: DRAW_LAYERS },
  quizStele: QUIZ_STELE_ID,
  questions: QUESTIONS,
  dialogues: NPC_DIALOGUES,
  rewards: REWARD_NAMES,
  chapterEnd: CHAPTER_END,
  // Tên lửa trúng ở màn 3 báo câu riêng; câu khác dùng chung.
  text: { ...TEXT, get projectileHit() { return state.battle ? BOSS_TEXT.arrowHit : TEXT.projectileHit; } },
  audio: { sfx: SFX, music: MUSIC, musicFiles: MUSIC_FILES },
  // Tên màn + câu mô tả màn 1: NQ-00 §5.1 (duyệt 11/11/2026).
  levels: {
    1: {
      id: 1, title: 'Màn 1: Hành quân ra Bắc', url: LEVEL_URLS[1],
      chunks: LEVEL1_CHUNKS, worldWidth: CHUNK_W * LEVEL1_CHUNKS, zones: LEVEL1_ZONES, finishX: LEVEL1_FINISH_X, gate: FINISH_GATE,
      sprites: LEVEL_SPRITES[1],
      content: level1Content,
      events: level1Events,
      // Ngô Quyền chờ người chơi ở đầu màn (thoại NQ-00 §5.1).
      guide: { npc: 'ngoQuyen', localX: GUIDE_LOCAL_X, story: STORY_NQ_INTRO },
      introMessage: 'Màn 1: Hành quân ra Bắc — Năm 937, Kiều Công Tiễn giết Dương Đình Nghệ rồi cầu cứu nhà Nam Hán. Năm 938, hãy cùng Ngô Quyền từ Ái Châu ra Bắc, thu đủ 5 Quyển Sách Tinh Hoa.',
      introMessageTime: 4200,
      // Layout thử cơ chế NQ-ENGINE: ?layout=engine.
      testLayout: 'engine',
      summary: state => `Bạn thu thập ${state.itemsCollected}/5 Quyển Sách Tinh Hoa và đạt ${state.score} điểm.`
    },
    2: {
      id: 2, title: 'Màn 2: Trận địa cọc ngầm', url: LEVEL_URLS[2],
      chunks: LEVEL2_CHUNKS, worldWidth: CHUNK_W * LEVEL2_CHUNKS, zones: LEVEL2_ZONES, finishX: LEVEL2_FINISH_X, gate: null,
      sprites: LEVEL_SPRITES[2],
      content: level2Content,
      events: level2Events,
      // Thủy triều + cắm cọc (NQ-ENGINE E2, E5): cắm đủ 3/6 mới về đích.
      tide: LEVEL2_TIDE,
      stakesRequired: LEVEL2_STAKES_REQUIRED,
      introMessage: 'Màn 2: Trận địa cọc ngầm',
      summary: state => `Bạn thu thập ${state.itemsCollected}/10 Quyển Sách Tinh Hoa, cắm ${state.stakesPlanted}/6 cọc và đạt ${state.score} điểm.`
    },
    3: {
      id: 3, title: 'Màn 3: Đại thắng Bạch Đằng', url: LEVEL_URLS[3],
      chunks: 1, worldWidth: ARENA.width, zones: LEVEL3_ZONES, finishX: ARENA.width, arena: true,
      playerStartX: ARENA.playerStartX, gate: null,
      sprites: LEVEL_SPRITES[3],
      content: level3Content,
      update: updateBattle,
      cutscene: updateCutscene,
      // Triều do trận ép (forceTide): GĐ 1 nước lớn, GĐ 2 nước rút.
      tide: LEVEL3_TIDE,
      introMessage: 'Màn 3: Đại thắng Bạch Đằng',
      // Layout thử: ?layout=lowtide (vào thẳng GĐ 2; thêm ?debug=1 để đủ phần thưởng).
      testLayout: 'lowtide',
      skills: true,
      summary: current => `Bạn đạt ${current.score} điểm.`
    }
  }
};
