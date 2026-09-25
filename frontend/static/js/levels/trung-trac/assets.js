// Tải ảnh + manifest sprite 8-bit cho màn chơi. Không đụng tới DOM ngoài Image()/URL — không biết
// gì về `ui`/canvas, chỉ trả về dữ liệu để main.js quyết định hiển thị gì.

import {
  BACKDROP_ROOT, BACKDROP_LAYERS, LANDMARKS,
  OBSTACLE_SPRITE_ROOT, OBSTACLE_SPRITE_FILES,
  ITEM_ROOT, ITEM_FILES,
  SPRITE_8BIT_ROOT, SPRITE_MANIFEST_FILE, SPRITE_8BIT_IN_GAME
} from './config.js';
import { registerManifest, getAsset } from './animation.js';

// Cache ảnh đã tải — mutate thuộc tính tại chỗ, các module khác import
// `images` và đọc trực tiếp (không cần setter riêng vì object không bị gán lại).
export const images = {
  backdrops: {},
  landmarkCache: {},
  obstacleSprites: {},
  items: {},
  // Strip bộ sprite 8-bit: sprites8[assetId][animationName] = Image.
  sprites8: {}
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

async function loadItemSprites() {
  const entries = await Promise.all(Object.entries(ITEM_FILES).map(async ([name, fileName]) => [
    name,
    await loadImage(joinAssetPath(ITEM_ROOT, fileName), true)
  ]));
  return Object.fromEntries(entries);
}

// Tải mọi strip (mọi animation) của các asset 8-bit game dùng. Trả về danh
// sách "ID.animation" thiếu ảnh hoặc thiếu hẳn trong manifest.
async function loadSprites8bit() {
  const manifest = await loadSpriteManifest();
  registerManifest(manifest);
  const sprites = {};
  const missing = [];
  await Promise.all(SPRITE_8BIT_IN_GAME.map(async id => {
    const asset = getAsset(id);
    if (!asset) {
      missing.push(id);
      return;
    }
    sprites[id] = {};
    await Promise.all(asset.animations.map(async anim => {
      const image = await loadImage(joinAssetPath(SPRITE_8BIT_ROOT, anim.file), true);
      if (image) sprites[id][anim.name] = image;
      else missing.push(`${id}.${anim.name}`);
    }));
  }));
  return { sprites, missing, manifestLoaded: Boolean(manifest) };
}

// Tải toàn bộ asset, ghi vào `images`, và trả về số lượng thiếu để caller
// (main.js) tự quyết định hiển thị thông báo/log thế nào.
export async function loadAssets() {
  const [
    backdrops, landmarkCache, obstacleSprites, itemSprites, sprite8Set
  ] = await Promise.all([
    loadBackdropLayers(),
    loadLandmarkImages(),
    loadObstacleSprites(),
    loadItemSprites(),
    loadSprites8bit()
  ]);
  images.backdrops = backdrops;
  images.landmarkCache = landmarkCache;
  images.obstacleSprites = obstacleSprites;
  images.items = itemSprites;
  images.sprites8 = sprite8Set.sprites;

  return {
    missingBackdrops: BACKDROP_LAYERS.filter(layer => !images.backdrops[layer.key]).length,
    missingObstacleSprites: Object.keys(OBSTACLE_SPRITE_FILES).filter(type => !images.obstacleSprites[type]).length,
    missingItems: Object.keys(ITEM_FILES).filter(name => !images.items[name]).length,
    manifestLoaded: sprite8Set.manifestLoaded,
    missingSprites8: sprite8Set.missing
  };
}

// Manifest bộ sprite 8-bit (manifest_tt.json) — nguồn duy nhất cho
// frames/fps/loop/hit_frame. Lỗi mạng/JSON thì trả null để caller tự báo.
export async function loadSpriteManifest() {
  try {
    const response = await fetch(joinAssetPath(SPRITE_8BIT_ROOT, SPRITE_MANIFEST_FILE));
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
