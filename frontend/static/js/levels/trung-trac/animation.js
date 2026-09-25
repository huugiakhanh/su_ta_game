// Trạng thái animation theo từng entity + tra cứu manifest bộ sprite 8-bit.
// Dùng chung bởi physics.js (thời điểm gây sát thương / nhả đạn theo
// hit_frame) và render.js (chọn ô cần vẽ) — tách riêng để hai module đó không
// phụ thuộc vòng nhau. Không đụng DOM, không đụng state.
//
// Mỗi entity giữ `anim = { name, time }`: `time` là số giây animation ĐÓ đã
// chạy (đồng hồ riêng, không theo đồng hồ chung của game).

let manifestById = new Map();

// assets.js gọi sau khi tải manifest_tt.json. Manifest là nguồn DUY NHẤT cho
// frames/fps/loop/hit_frame — không chép các số này sang config.js.
export function registerManifest(manifest) {
  manifestById = new Map((manifest?.assets || []).map(asset => [asset.id, asset]));
}

export function getAsset(id) {
  return manifestById.get(id) || null;
}

// { ...animation trong manifest, frame_w, frame_h } hoặc null nếu thiếu.
export function getAnimMeta(id, name) {
  const asset = manifestById.get(id);
  const anim = asset?.animations.find(item => item.name === name);
  return anim ? { ...anim, frame_w: asset.frame_w, frame_h: asset.frame_h } : null;
}

export function createAnim(name) {
  return { name, time: 0 };
}

// Đổi animation. Đang phát đúng tên đó thì KHÔNG khởi động lại.
export function setAnim(entity, name) {
  if (!entity.anim) entity.anim = createAnim(name);
  else if (entity.anim.name !== name) {
    entity.anim.name = name;
    entity.anim.time = 0;
  }
  return entity.anim;
}

export function tickAnim(entity, dt) {
  if (entity.anim) entity.anim.time += dt;
}

// Ô (0-based) cần vẽ tại thời điểm `time`. `duration` (giây) nếu có sẽ trải cả
// strip trên đúng khoảng đó thay vì dùng fps của manifest (vd. đòn đánh phải
// khớp attackCooldown). Không lặp -> dừng ở ô cuối.
export function frameIndex(meta, time, duration = null) {
  const fps = duration ? meta.frames / duration : meta.fps;
  const raw = Math.floor(Math.max(0, time) * fps + 1e-6);
  return meta.loop ? raw % meta.frames : Math.min(raw, meta.frames - 1);
}

// Thời điểm (giây từ đầu animation) BẮT ĐẦU ô hit_frame. hit_frame trong
// manifest đếm từ 1. Không có hit_frame -> 0 (tác dụng ngay).
export function hitTime(meta, duration = null) {
  if (!meta?.hit_frame) return 0;
  const frameDuration = duration ? duration / meta.frames : 1 / meta.fps;
  return (meta.hit_frame - 1) * frameDuration;
}

// Tổng thời lượng (giây) một lượt animation: `duration` nếu ép, không thì
// frames / fps của manifest.
export function animLength(meta, duration = null) {
  return duration ?? meta.frames / meta.fps;
}
