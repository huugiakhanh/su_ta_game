// Tải ảnh + manifest bộ 32-bit (sprite + môi trường) cho màn đang chơi. Không
// đụng tới DOM ngoài Image()/URL — không biết gì về `ui`/canvas, chỉ trả về dữ
// liệu để main.js quyết định hiển thị gì.
//
// Nạp theo màn (Phần D): sprite canvas chỉ những ID trong LEVEL_SPRITES của màn
// đang chơi; nền chỉ các vùng của màn (đồi xa bỏ khi mọi vùng dùng trời che nó).

import {
  SPRITE_ROOT, SPRITE_MANIFEST_FILE, LEVEL_SPRITES, SPRITE_DOM_IN_GAME,
  MAP_ROOT, MAP_MANIFEST_FILE, TILESET_ID, TERRAIN_TILESET_ID, TERRAIN_TILE_ROLES, LEVEL, FAR_HILLS, MAP_PROPS_IN_GAME,
  GROUND_Y, LEVEL_WORLD_WIDTH, VIEW_H
} from './config.js';
import { registerManifest, getAsset } from './animation.js';

// Cache ảnh đã tải — mutate thuộc tính tại chỗ, các module khác import
// `images` và đọc trực tiếp (không cần setter riêng vì object không bị gán lại).
// Mọi ảnh mang `image.density` (pixel ảnh / pixel logic) — render quy đổi toạ
// độ nguồn qua đó.
export const images = {
  // Bộ môi trường: maps.layers[assetId] = Image (trời, đồi, lớp giữa);
  // maps.tileset = { image, tileW, tileH, regions: { Z1: { surface: [rect]... } } };
  // maps.terrain = { image, tileW, tileH, roles: { surface: rect... } } | null
  // (bộ tile ghép địa hình TILESET_TT_TERRAIN);
  // maps.props[assetId] = { image, asset, states } (vật cản, bình thư, cổng — `asset`
  // là mục trong maps_tt.json: w/h, frame_w/h, frames, visible_bbox, pivot).
  maps: { layers: {}, tileset: null, terrain: null, props: {} },
  // Strip sprite: sprites[assetId][animationName] = Image.
  sprites: {},
  // true khi loadAssets() xong (render chỉ cảnh báo sprite chưa nạp sau mốc này).
  loaded: false
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

// maps_tt.json — viewer.js cũng dùng. Lỗi/chưa có thì trả null.
export function loadMapManifest() {
  return fetchJson(MAP_ROOT, MAP_MANIFEST_FILE);
}

// Manifest sprite (manifest_tt.json) — nguồn duy nhất cho frames/fps/loop/
// hit_frame; viewer.js cũng dùng. Lỗi mạng/JSON thì trả null để caller tự báo.
export function loadSpriteManifest() {
  return fetchJson(SPRITE_ROOT, SPRITE_MANIFEST_FILE);
}

// ID lớp nền màn đang chơi cần: trời + lớp giữa của mọi vùng, và đồi xa — trừ
// khi trời của MỌI vùng đều che đồi xa (FAR_HILLS.hiddenUnderSky — màn 3).
function backdropIds() {
  const skies = LEVEL.zones.map(zone => zone.sky);
  const hillsVisible = skies.some(sky => !FAR_HILLS.hiddenUnderSky.includes(sky));
  return [...new Set([...LEVEL.zones.flatMap(zone => [zone.sky, zone.mid]), ...(hillsVisible ? [FAR_HILLS.id] : [])])];
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

const densityOf = asset => (Number.isInteger(asset.density) && asset.density >= 1 ? asset.density : 1);

// Ảnh của 1 asset môi trường, gắn `image.density`. Ảnh phải đúng cỡ
// w×density × h×density (render đặt ảnh theo số logic để phần nhìn thấy trùng
// hitbox/mặt đất) — sai cỡ hoặc thiếu thì cảnh báo và trả null (vẽ tạm).
// Trả về { asset, image } hoặc null.
async function loadMapEntry(id, byId) {
  const asset = byId[id];
  if (!asset) return null;
  const image = await loadImage(joinAssetPath(MAP_ROOT, asset.file), true);
  if (!image) return null;
  const density = densityOf(asset);
  if (image.naturalWidth !== asset.w * density || image.naturalHeight !== asset.h * density) {
    console.warn(`maps_tt: ${id} là ${image.naturalWidth}x${image.naturalHeight}, cần ${asset.w * density}x${asset.h * density}`);
    return null;
  }
  image.density = density;
  return { asset, image };
}

// Tileset: ảnh + metadata (tileset_tt_*.json, rect logic). Trả về { entry, meta } hoặc null.
async function loadTilesetEntry(id, byId) {
  const entry = await loadMapEntry(id, byId);
  if (!entry) return null;
  const meta = await fetchJson(MAP_ROOT, entry.asset.metadata);
  return meta ? { entry, meta } : null;
}

// Nạp maps_tt.json + các lớp nền + tileset mặt đất + prop. Trả về danh sách ID thiếu.
async function loadMapAssets() {
  const manifest = await loadMapManifest();
  const layers = {};
  if (!manifest) return { layers, tileset: null, terrain: null, props: {}, missing: [MAP_MANIFEST_FILE] };
  const stage = manifest.stage || {};
  // maps_tt.json mô tả màn 1 (12 chunk); màn 2 ngắn hơn nên chỉ so GROUND_Y.
  const lengthMismatch = LEVEL.id === 1 && stage.stage_length !== LEVEL_WORLD_WIDTH;
  if (stage.ground_y !== GROUND_Y || lengthMismatch) {
    console.warn('maps_tt: stage khác config.js', stage, { GROUND_Y, LEVEL_WORLD_WIDTH });
  }
  const byId = Object.fromEntries(manifest.assets.map(asset => [asset.id, asset]));
  const missing = [];

  await Promise.all(backdropIds().map(async id => {
    const entry = await loadMapEntry(id, byId);
    if (entry) layers[id] = entry.image;
    else missing.push(id);
  }));

  let tileset = null;
  const ground = await loadTilesetEntry(TILESET_ID, byId);
  if (ground) {
    const slice = ground.meta.runtime_slice;
    if (slice && GROUND_Y + slice.surface_height + slice.fill_visible_height !== VIEW_H) {
      console.warn('tileset: surface + fill không phủ đúng tới đáy khung', slice);
    }
    tileset = { image: ground.entry.image, tileW: ground.meta.tile_size.w, tileH: ground.meta.tile_size.h, regions: indexTiles(ground.meta) };
  } else missing.push(TILESET_ID);
  const terrain = await loadTerrainTiles(byId);

  // Vật cản, bình thư, cổng: giữ kèm mục manifest để render đọc cỡ/bbox/pivot.
  // Asset có `state_files` (bia đá câu hỏi: active/done; cột đá) thì nạp thêm
  // ảnh từng trạng thái vào `states[tên]` cùng mật độ với ảnh chính (thiếu ảnh
  // trạng thái nào thì bỏ trạng thái đó).
  const props = {};
  await Promise.all(MAP_PROPS_IN_GAME.map(async id => {
    const entry = await loadMapEntry(id, byId);
    if (!entry) {
      missing.push(id);
      return;
    }
    const states = {};
    await Promise.all(Object.entries(entry.asset.state_files || {}).map(async ([name, file]) => {
      const stateImage = await loadImage(joinAssetPath(MAP_ROOT, file), true);
      if (!stateImage) return;
      stateImage.density = entry.image.density;
      states[name] = stateImage;
    }));
    props[id] = { image: entry.image, asset: entry.asset, states };
  }));
  return { layers, tileset, terrain, props, missing };
}

// Bộ tile ghép địa hình TILESET_TT_TERRAIN (TT-TERRAIN-01): { image, tileW,
// tileH, roles: { role: rect } } — 1 tile/vai trò (tile đầu tiên). Không có
// trong maps_tt.json thì trả null, KHÔNG tính là thiếu — render dự phòng bằng
// tile Z1 của TILESET_TT_GROUND. Thiếu vai trò nào thì cảnh báo.
async function loadTerrainTiles(byId) {
  if (!byId[TERRAIN_TILESET_ID]) return null;
  const loaded = await loadTilesetEntry(TERRAIN_TILESET_ID, byId);
  if (!loaded) {
    console.warn(`maps_tt: không nạp được ${TERRAIN_TILESET_ID}`);
    return null;
  }
  const roles = {};
  loaded.meta.tiles.forEach(tile => { roles[tile.role] ||= tile.rect; });
  const absent = TERRAIN_TILE_ROLES.filter(role => !roles[role]);
  if (absent.length) console.warn(`${TERRAIN_TILESET_ID} thiếu vai trò:`, absent);
  return { image: loaded.entry.image, tileW: loaded.meta.tile_size.w, tileH: loaded.meta.tile_size.h, roles };
}

// Tải mọi strip của 1 asset. Ảnh phải đúng cỡ (frames * frame_w * density) x
// (frame_h * density) — animation có `frame_w` riêng thì dùng số đó.
// Trả về { strips, missing }.
async function loadStrips(asset) {
  const density = densityOf(asset);
  const strips = {};
  const missing = [];
  await Promise.all(asset.animations.map(async anim => {
    const image = await loadImage(joinAssetPath(SPRITE_ROOT, anim.file), true);
    const w = anim.frames * (anim.frame_w || asset.frame_w) * density;
    const h = asset.frame_h * density;
    if (!image) missing.push(`${asset.id}.${anim.name}`);
    else if (image.naturalWidth !== w || image.naturalHeight !== h) {
      missing.push(`${asset.id}.${anim.name} (${image.naturalWidth}x${image.naturalHeight}, cần ${w}x${h})`);
    } else {
      image.density = density;
      strips[anim.name] = image;
    }
  }));
  return { strips, missing };
}

// URL ảnh đầu tiên của asset (chân dung, icon — hiển thị bằng DOM). Thiếu -> null.
export function spriteUrl(id) {
  const file = getAsset(id)?.animations?.[0]?.file;
  return file ? joinAssetPath(SPRITE_ROOT, file) : null;
}

// Tải strip các sprite màn đang chơi cần (LEVEL_SPRITES) + ảnh DOM (chân dung,
// icon — mọi màn). Trả về danh sách "ID.animation" thiếu ảnh/sai cỡ hoặc ID
// thiếu hẳn trong manifest.
async function loadSprites() {
  const manifest = await loadSpriteManifest();
  registerManifest(manifest);
  const sprites = {};
  const missing = [];
  const ids = [...new Set([...(LEVEL_SPRITES[LEVEL.id] || []), ...SPRITE_DOM_IN_GAME])];
  await Promise.all(ids.map(async id => {
    const asset = getAsset(id);
    if (!asset) {
      missing.push(id);
      return;
    }
    const loaded = await loadStrips(asset);
    sprites[id] = loaded.strips;
    missing.push(...loaded.missing);
  }));
  return { sprites, missing, manifestLoaded: Boolean(manifest) };
}

// Tải toàn bộ asset màn đang chơi, ghi vào `images`, và trả về danh sách thiếu
// để caller (main.js) tự quyết định hiển thị thông báo/log thế nào.
export async function loadAssets() {
  const [mapSet, spriteSet] = await Promise.all([loadMapAssets(), loadSprites()]);
  images.maps = { layers: mapSet.layers, tileset: mapSet.tileset, terrain: mapSet.terrain, props: mapSet.props };
  images.sprites = spriteSet.sprites;
  images.loaded = true;
  return {
    missingMaps: mapSet.missing,
    manifestLoaded: spriteSet.manifestLoaded,
    missingSprites: spriteSet.missing
  };
}
