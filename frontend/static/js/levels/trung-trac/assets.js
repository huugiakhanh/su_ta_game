// Tải ảnh/GIF cho màn chơi. Không đụng tới DOM ngoài Image()/URL — không biết
// gì về `ui`/canvas, chỉ trả về dữ liệu để main.js quyết định hiển thị gì.

import {
  BACKDROP_ROOT, BACKDROP_LAYERS, LANDMARKS,
  OBSTACLE_SPRITE_ROOT, OBSTACLE_SPRITE_FILES, OBSTACLE_STRIP_FILES,
  ITEM_ROOT, ITEM_FILES, ITEM_STRIP_FILES,
  PLAYER_ROOT_CANDIDATES, PLAYER_ANIMATION_FILES
} from './config.js';

// Cache ảnh đã tải — mutate thuộc tính tại chỗ, các module khác import
// `images` và đọc trực tiếp (không cần setter riêng vì object không bị gán lại).
export const images = {
  backdrops: {},
  landmarkCache: {},
  obstacleSprites: {},
  // Strip động (obstacle/enemy) và strip đạn — tách khỏi cache ảnh tĩnh để
  // render biết ngay phải cắt ô hay vẽ nguyên ảnh.
  obstacleStrips: {},
  itemStrips: {},
  items: {},
  player: {},
  playerRoot: ''
};

export function loadImage(src, optional = false) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(optional ? null : { failed: true, src });
    image.src = src;
  });
}

export function joinAssetPath(root, fileName) {
  return new URL(fileName, new URL(root, document.baseURI)).href;
}

async function loadBackdropLayers() {
  const entries = await Promise.all(BACKDROP_LAYERS.map(async layer => [
    layer.key,
    await loadImage(joinAssetPath(BACKDROP_ROOT, layer.file), true)
  ]));
  return Object.fromEntries(entries);
}

async function loadLandmarkImages() {
  const cache = {};
  await Promise.all(LANDMARKS.map(async landmark => {
    if (cache[landmark.file]) return;
    cache[landmark.file] = await loadImage(joinAssetPath(BACKDROP_ROOT, landmark.file), true);
  }));
  return cache;
}

async function loadObstacleSprites() {
  const entries = await Promise.all(Object.entries(OBSTACLE_SPRITE_FILES).map(async ([type, fileName]) => [
    type,
    await loadImage(joinAssetPath(OBSTACLE_SPRITE_ROOT, fileName), true)
  ]));
  return Object.fromEntries(entries);
}

// Dùng chung cho OBSTACLE_STRIP_FILES và ITEM_STRIP_FILES: giá trị là
// { file, frames, fps } nên chỉ cần lấy `file` ra tải, meta do config giữ.
async function loadStripSprites(root, table) {
  const entries = await Promise.all(Object.entries(table).map(async ([name, meta]) => [
    name,
    await loadImage(joinAssetPath(root, meta.file), true)
  ]));
  return Object.fromEntries(entries);
}

async function loadItemSprites() {
  const entries = await Promise.all(Object.entries(ITEM_FILES).map(async ([name, fileName]) => [
    name,
    await loadImage(joinAssetPath(ITEM_ROOT, fileName), true)
  ]));
  return Object.fromEntries(entries);
}

async function findPlayerAnimations() {
  for (const root of PLAYER_ROOT_CANDIDATES) {
    const entries = await Promise.all(Object.entries(PLAYER_ANIMATION_FILES).map(async ([stateName, fileName]) => [
      stateName,
      await loadImage(joinAssetPath(root, fileName), true)
    ]));
    const animations = Object.fromEntries(entries);
    if (animations.idle) return { root, animations };
  }
  return { root: PLAYER_ROOT_CANDIDATES[0], animations: {} };
}

// Tải toàn bộ asset, ghi vào `images`, và trả về số lượng thiếu để caller
// (main.js) tự quyết định hiển thị thông báo/log thế nào.
export async function loadAssets() {
  const [
    backdrops, landmarkCache, obstacleSprites, obstacleStrips, itemSprites, itemStrips, playerSet
  ] = await Promise.all([
    loadBackdropLayers(),
    loadLandmarkImages(),
    loadObstacleSprites(),
    loadStripSprites(OBSTACLE_SPRITE_ROOT, OBSTACLE_STRIP_FILES),
    loadItemSprites(),
    loadStripSprites(ITEM_ROOT, ITEM_STRIP_FILES),
    findPlayerAnimations()
  ]);
  images.backdrops = backdrops;
  images.landmarkCache = landmarkCache;
  images.obstacleSprites = obstacleSprites;
  images.obstacleStrips = obstacleStrips;
  images.items = itemSprites;
  images.itemStrips = itemStrips;
  images.player = playerSet.animations;
  images.playerRoot = playerSet.root;

  return {
    missingBackdrops: BACKDROP_LAYERS.filter(layer => !images.backdrops[layer.key]).length,
    missingObstacleSprites: Object.keys(OBSTACLE_SPRITE_FILES).filter(type => !images.obstacleSprites[type]).length,
    missingStrips: [
      ...Object.keys(OBSTACLE_STRIP_FILES).filter(name => !images.obstacleStrips[name]),
      ...Object.keys(ITEM_STRIP_FILES).filter(name => !images.itemStrips[name])
    ],
    missingItems: Object.keys(ITEM_FILES).filter(name => !images.items[name]).length,
    missingAnimations: Object.keys(PLAYER_ANIMATION_FILES).filter(name => !images.player[name])
  };
}
