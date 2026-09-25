// Tải ảnh + manifest sprite 8-bit cho màn chơi. Không đụng tới DOM ngoài Image()/URL — không biết
// gì về `ui`/canvas, chỉ trả về dữ liệu để main.js quyết định hiển thị gì.

import {
  ITEM_ROOT, ITEM_FILES,
  SPRITE_8BIT_ROOT, SPRITE_MANIFEST_FILE, SPRITE_8BIT_IN_GAME,
  MAP_8BIT_ROOT, MAP_MANIFEST_FILE, TILESET_ID, ZONES, FAR_HILLS, MAP_PROPS_IN_GAME,
  GROUND_Y, LEVEL_WORLD_WIDTH, VIEW_H
} from './config.js';
import { registerManifest, getAsset } from './animation.js';

// Cache ảnh đã tải — mutate thuộc tính tại chỗ, các module khác import
// `images` và đọc trực tiếp (không cần setter riêng vì object không bị gán lại).
export const images = {
  // Bộ môi trường 8-bit: maps.layers[assetId] = Image (trời, đồi, lớp giữa);
  // maps.tileset = { image, tileW, tileH, regions: { Z1: { surface: [rect]... } } };
  // maps.props[assetId] = { image, asset } (vật cản, bình thư, cổng — `asset`
  // là mục trong maps_tt.json: w/h, frame_w/h, frames, visible_bbox, pivot).
  maps: { layers: {}, tileset: null, props: {} },
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

async function fetchJson(root, fileName) {
  try {
    const response = await fetch(joinAssetPath(root, fileName));
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// maps_tt.json (bộ môi trường 8-bit) — viewer.js cũng dùng. Lỗi thì trả null.
export function loadMapManifest() {
  return fetchJson(MAP_8BIT_ROOT, MAP_MANIFEST_FILE);
}

// ID lớp nền màn chơi cần (trời + lớp giữa của mọi vùng, đồi xa).
function backdropIds() {
  return [...new Set([...ZONES.flatMap(zone => [zone.sky, zone.mid]), FAR_HILLS.id])];
}

// Ảnh đã tải phải đúng cỡ khai báo trong maps_tt.json (vẽ x1, lặp theo chiều
// rộng gốc) — lệch thì chỉ cảnh báo, vẫn vẽ theo cỡ thật.
function checkSize(asset, image) {
  if (image.naturalWidth !== asset.w || image.naturalHeight !== asset.h) {
    console.warn(`maps_tt: ${asset.id} là ${image.naturalWidth}x${image.naturalHeight}, manifest ghi ${asset.w}x${asset.h}`);
  }
}

// Gom tile theo vùng và vai trò (surface / fill / left-edge / right-edge /
// decoration) từ tileset_tt_ground.json — không viết cứng toạ độ tile trong code.
function indexTiles(meta) {
  const regions = {};
  meta.tiles.forEach(tile => {
    const region = regions[tile.region] ||= {};
    (region[tile.role] ||= []).push(tile.rect);
  });
  return regions;
}

// Nạp maps_tt.json + các lớp nền + tileset mặt đất. Trả về danh sách ID thiếu.
async function loadMapAssets() {
  const manifest = await loadMapManifest();
  const layers = {};
  if (!manifest) return { layers, tileset: null, props: {}, missing: [MAP_MANIFEST_FILE] };
  const stage = manifest.stage || {};
  if (stage.ground_y !== GROUND_Y || stage.stage_length !== LEVEL_WORLD_WIDTH) {
    console.warn('maps_tt: stage khác config.js', stage, { GROUND_Y, LEVEL_WORLD_WIDTH });
  }
  const byId = Object.fromEntries(manifest.assets.map(asset => [asset.id, asset]));
  const missing = [];

  await Promise.all(backdropIds().map(async id => {
    const asset = byId[id];
    const image = asset ? await loadImage(joinAssetPath(MAP_8BIT_ROOT, asset.file), true) : null;
    if (!image) {
      missing.push(id);
      return;
    }
    checkSize(asset, image);
    layers[id] = image;
  }));

  let tileset = null;
  const tileAsset = byId[TILESET_ID];
  if (tileAsset) {
    const [meta, image] = await Promise.all([
      fetchJson(MAP_8BIT_ROOT, tileAsset.metadata),
      loadImage(joinAssetPath(MAP_8BIT_ROOT, tileAsset.file), true)
    ]);
    if (meta && image) {
      checkSize(tileAsset, image);
      const slice = meta.runtime_slice || {};
      if (GROUND_Y + slice.surface_height + slice.fill_visible_height !== VIEW_H) {
        console.warn('tileset: surface + fill không phủ đúng tới đáy khung', slice);
      }
      tileset = { image, tileW: meta.tile_size.w, tileH: meta.tile_size.h, regions: indexTiles(meta) };
    }
  }
  if (!tileset) missing.push(TILESET_ID);

  // Vật cản, bình thư, cổng: giữ kèm mục manifest để render đọc cỡ/bbox/pivot.
  const props = {};
  await Promise.all(MAP_PROPS_IN_GAME.map(async id => {
    const asset = byId[id];
    const image = asset ? await loadImage(joinAssetPath(MAP_8BIT_ROOT, asset.file), true) : null;
    if (!image) {
      missing.push(id);
      return;
    }
    checkSize(asset, image);
    props[id] = { image, asset };
  }));
  return { layers, tileset, props, missing };
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
    mapSet, itemSprites, sprite8Set
  ] = await Promise.all([
    loadMapAssets(),
    loadItemSprites(),
    loadSprites8bit()
  ]);
  images.maps = { layers: mapSet.layers, tileset: mapSet.tileset, props: mapSet.props };
  images.items = itemSprites;
  images.sprites8 = sprite8Set.sprites;

  return {
    missingMaps: mapSet.missing,
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
