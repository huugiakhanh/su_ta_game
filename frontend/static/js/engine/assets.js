// Tải ảnh + manifest bộ 32-bit (sprite + môi trường) cho màn đang chơi. Không
// đụng tới DOM ngoài Image()/URL — không biết gì về `ui`/canvas, chỉ trả về dữ
// liệu để main.js quyết định hiển thị gì.
//
// Hai manifest sprite (ENGINE-01): manifest CHUNG (nhân vật nam/nữ, icon HUD —
// SHARED_SPRITE_ROOT) + manifest CHƯƠNG (CHAPTER.spriteRoot). Mỗi asset nhớ thư
// mục gốc của mình (`asset.root`, animation.js). Môi trường (nền, tile, prop):
// manifest chương (CHAPTER.mapRoot) + asset MƯỢN của chương khác
// (CHAPTER.borrowedMaps — vd. Bà Triệu dùng lại trời, tile, bia câu hỏi của
// Trưng Trắc); mỗi mục map cũng nhớ thư mục gốc (`asset.root`).
// Nạp theo màn (Phần D): sprite canvas chỉ những ID trong LEVEL.sprites; nền
// chỉ các vùng của màn (đồi xa bỏ khi mọi vùng dùng trời che nó).

import {
  SHARED_SPRITE_ROOT, SHARED_MANIFEST_FILE, SHARED_DOM_SPRITES, TERRAIN_TILE_ROLES, GROUND_Y, VIEW_H
} from './config.js';
import { CHAPTER, LEVEL } from './chapter.js';
import { registerManifest, getAsset } from './animation.js';

// Cache ảnh đã tải — mutate thuộc tính tại chỗ, các module khác import
// `images` và đọc trực tiếp (không cần setter riêng vì object không bị gán lại).
// Mọi ảnh mang `image.density` (pixel ảnh / pixel logic) — render quy đổi toạ
// độ nguồn qua đó.
export const images = {
  // Bộ môi trường: maps.layers[assetId] = Image (trời, đồi, lớp giữa);
  // maps.tileset = { image, tileW, tileH, regions: { Z1: { surface: [rect]... } } };
  // maps.terrain = { image, tileW, tileH, roles: { surface: rect... } } | null
  // (bộ tile ghép địa hình CHAPTER.tiles.terrain);
  // maps.props[assetId] = { image, asset, states } (vật cản, vật phẩm, cổng — `asset`
  // là mục trong manifest map: w/h, frame_w/h, frames, visible_bbox, pivot).
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

// Manifest map của chương — viewer.js cũng dùng. Lỗi/chưa có thì trả null.
export function loadMapManifest() {
  return fetchJson(CHAPTER.mapRoot, CHAPTER.mapManifest);
}

// Manifest sprite của chương / manifest chung — nguồn duy nhất cho frames/fps/
// loop/hit_frame; viewer.js cũng dùng. Lỗi mạng/JSON thì trả null để caller tự báo.
export function loadSpriteManifest() {
  return fetchJson(CHAPTER.spriteRoot, CHAPTER.spriteManifest);
}

export function loadSharedManifest() {
  return fetchJson(SHARED_SPRITE_ROOT, SHARED_MANIFEST_FILE);
}

// ID lớp nền màn đang chơi cần: trời + lớp giữa của mọi vùng, và đồi xa — trừ
// khi trời của MỌI vùng đều che đồi xa (farHills.hiddenUnderSky — vd. màn 3 Trưng Trắc).
function backdropIds() {
  const hills = CHAPTER.farHills;
  const skies = LEVEL.zones.map(zone => zone.sky);
  const hillsVisible = hills && skies.some(sky => !hills.hiddenUnderSky.includes(sky));
  return [...new Set([...LEVEL.zones.flatMap(zone => [zone.sky, zone.mid]), ...(hillsVisible ? [hills.id] : [])])];
}

// Gom tile theo vùng và vai trò (surface / fill / left-edge / right-edge /
// decoration) từ metadata tileset — không viết cứng toạ độ tile trong code.
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
  const image = await loadImage(joinAssetPath(asset.root, asset.file), true);
  if (!image) return null;
  const density = densityOf(asset);
  if (image.naturalWidth !== asset.w * density || image.naturalHeight !== asset.h * density) {
    console.warn(`${CHAPTER.mapManifest}: ${id} là ${image.naturalWidth}x${image.naturalHeight}, cần ${asset.w * density}x${asset.h * density}`);
    return null;
  }
  image.density = density;
  return { asset, image };
}

// Tileset: ảnh + metadata (json riêng của tileset, rect logic). Trả về { entry, meta } hoặc null.
async function loadTilesetEntry(id, byId) {
  const entry = await loadMapEntry(id, byId);
  if (!entry) return null;
  const meta = await fetchJson(entry.asset.root, entry.asset.metadata);
  return meta ? { entry, meta } : null;
}

// Nạp manifest map + các lớp nền + tileset mặt đất + prop. Trả về danh sách ID thiếu.
async function loadMapAssets() {
  const manifest = await loadMapManifest();
  const layers = {};
  if (!manifest) return { layers, tileset: null, terrain: null, props: {}, missing: [CHAPTER.mapManifest] };
  const stage = manifest.stage || {};
  // Manifest map mô tả màn 1 của chương; màn khác dài khác nên chỉ so GROUND_Y.
  const lengthMismatch = LEVEL.id === 1 && stage.stage_length !== LEVEL.worldWidth;
  if (stage.ground_y !== GROUND_Y || lengthMismatch) {
    console.warn(`${CHAPTER.mapManifest}: stage khác engine/chương`, stage, { GROUND_Y, worldWidth: LEVEL.worldWidth });
  }
  const byId = Object.fromEntries(manifest.assets.map(asset => [asset.id, { ...asset, root: CHAPTER.mapRoot }]));
  await addBorrowedMaps(byId);
  const missing = [];

  await Promise.all(backdropIds().map(async id => {
    const entry = await loadMapEntry(id, byId);
    if (entry) layers[id] = entry.image;
    else missing.push(id);
  }));

  let tileset = null;
  const ground = await loadTilesetEntry(CHAPTER.tiles.ground, byId);
  if (ground) {
    const slice = ground.meta.runtime_slice;
    if (slice && GROUND_Y + slice.surface_height + slice.fill_visible_height !== VIEW_H) {
      console.warn('tileset: surface + fill không phủ đúng tới đáy khung', slice);
    }
    tileset = { image: ground.entry.image, tileW: ground.meta.tile_size.w, tileH: ground.meta.tile_size.h, regions: indexTiles(ground.meta) };
  } else missing.push(CHAPTER.tiles.ground);
  const terrain = await loadTerrainTiles(byId);

  // Vật cản, vật phẩm, cổng: giữ kèm mục manifest để render đọc cỡ/bbox/pivot.
  // Asset có `state_files` (bia đá câu hỏi: active/done; cột đá) thì nạp thêm
  // ảnh từng trạng thái vào `states[tên]` cùng mật độ với ảnh chính (thiếu ảnh
  // trạng thái nào thì bỏ trạng thái đó).
  const props = {};
  await Promise.all(CHAPTER.mapProps.map(async id => {
    const entry = await loadMapEntry(id, byId);
    if (!entry) {
      missing.push(id);
      return;
    }
    const states = {};
    await Promise.all(Object.entries(entry.asset.state_files || {}).map(async ([name, file]) => {
      const stateImage = await loadImage(joinAssetPath(entry.asset.root, file), true);
      if (!stateImage) return;
      stateImage.density = entry.image.density;
      states[name] = stateImage;
    }));
    props[id] = { image: entry.image, asset: entry.asset, states };
  }));
  return { layers, tileset, terrain, props, missing };
}

// Asset map mượn của chương khác (CHAPTER.borrowedMaps = [{ root, manifest, ids }]):
// chỉ các ID liệt kê, ID trùng với manifest chương thì chương thắng. Thiếu
// manifest/ID thì cảnh báo (asset đó tính là thiếu khi nạp).
async function addBorrowedMaps(byId) {
  await Promise.all((CHAPTER.borrowedMaps || []).map(async ({ root, manifest, ids }) => {
    const borrowed = await fetchJson(root, manifest);
    if (!borrowed) {
      console.warn(`không nạp được manifest mượn ${manifest}`);
      return;
    }
    const source = Object.fromEntries(borrowed.assets.map(asset => [asset.id, asset]));
    ids.forEach(id => {
      if (byId[id]) return;
      if (source[id]) byId[id] = { ...source[id], root };
      else console.warn(`${manifest}: không có ${id} để mượn`);
    });
  }));
}

// Bộ tile ghép địa hình (TT-TERRAIN-01, CHAPTER.tiles.terrain): { image, tileW,
// tileH, roles: { role: rect } } — 1 tile/vai trò (tile đầu tiên). Không có
// trong manifest map thì trả null, KHÔNG tính là thiếu — render dự phòng bằng
// tileset mặt đất. Thiếu vai trò nào thì cảnh báo.
async function loadTerrainTiles(byId) {
  const id = CHAPTER.tiles.terrain;
  if (!id || !byId[id]) return null;
  const loaded = await loadTilesetEntry(id, byId);
  if (!loaded) {
    console.warn(`${CHAPTER.mapManifest}: không nạp được ${id}`);
    return null;
  }
  const roles = {};
  loaded.meta.tiles.forEach(tile => { roles[tile.role] ||= tile.rect; });
  const absent = TERRAIN_TILE_ROLES.filter(role => !roles[role]);
  if (absent.length) console.warn(`${id} thiếu vai trò:`, absent);
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
    const image = await loadImage(joinAssetPath(asset.root, anim.file), true);
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
  const asset = getAsset(id);
  const file = asset?.animations?.[0]?.file;
  return file ? joinAssetPath(asset.root, file) : null;
}

// Tải strip các sprite màn đang chơi cần (LEVEL.sprites) + ảnh DOM (icon chung
// + chân dung chương — mọi màn) + sprite người chơi. Trả về danh sách
// "ID.animation" thiếu ảnh/sai cỡ hoặc ID thiếu hẳn trong manifest.
// `playerSprite` (Promise<id>): sprite người chơi chỉ biết sau khi chọn giới tính
// (TT-HERO-01) — các sprite khác tải luôn, không chờ.
async function loadSprites(playerSprite) {
  const [shared, manifest] = await Promise.all([loadSharedManifest(), loadSpriteManifest()]);
  registerManifest(shared, SHARED_SPRITE_ROOT);
  registerManifest(manifest, CHAPTER.spriteRoot);
  // Ghi thẳng vào images.sprites: sprite nào xong thì vẽ được ngay (đang chờ chọn nhân vật).
  const sprites = images.sprites;
  const missing = [];
  const loadIds = ids => Promise.all(ids.map(async id => {
    const asset = getAsset(id);
    if (!asset) {
      missing.push(id);
      return;
    }
    const loaded = await loadStrips(asset);
    sprites[id] = loaded.strips;
    missing.push(...loaded.missing);
  }));
  const levelIds = [...new Set([...(LEVEL.sprites || []), ...SHARED_DOM_SPRITES, ...(CHAPTER.domSprites || [])])];
  await Promise.all([
    loadIds(levelIds),
    Promise.resolve(playerSprite).then(id => loadIds(levelIds.includes(id) ? [] : [id]))
  ]);
  return { sprites, missing, manifestLoaded: Boolean(manifest && shared) };
}

// Tải toàn bộ asset màn đang chơi, ghi vào `images`, và trả về danh sách thiếu
// để caller (main.js) tự quyết định hiển thị thông báo/log thế nào. Nền gán vào
// `images.maps` ngay khi xong (vẽ được sau bảng chọn nhân vật — TT-HERO-01).
export async function loadAssets(playerSprite) {
  const mapsReady = loadMapAssets().then(mapSet => {
    images.maps = { layers: mapSet.layers, tileset: mapSet.tileset, terrain: mapSet.terrain, props: mapSet.props };
    return mapSet;
  });
  const [mapSet, spriteSet] = await Promise.all([mapsReady, loadSprites(playerSprite)]);
  images.loaded = true;
  return {
    missingMaps: mapSet.missing,
    manifestLoaded: spriteSet.manifestLoaded,
    missingSprites: spriteSet.missing
  };
}
