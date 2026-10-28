// Chương + màn đang chơi (ENGINE-01). Engine dùng chung mọi chương; phần
// riêng của chương (asset, quân địch, nội dung màn, boss, kỹ năng, thoại) nằm
// trong MỘT object định nghĩa chương do `js/levels/<chương>/chapter.js` tạo,
// truyền vào boot() (main.js) -> setChapter(). Mọi module engine đọc qua
// `CHAPTER` / `LEVEL` (`export let` — live-binding như VIEW_W), KHÔNG import
// file nào của chương. Chỉ đọc CHAPTER/LEVEL bên trong hàm (không ở top-level
// module — lúc module nạp chưa có chương).
//
// Hợp đồng object chương (trường không bắt buộc ghi `?`):
//   id            số chương (kỷ lục gửi server: level_id = 100 × id + màn)
//   key           khoá ngắn, dùng cho sessionStorage tiến trình (`suta.<key>.progress`)
//   spriteRoot / spriteManifest   manifest sprite của chương
//   mapRoot / mapManifest         manifest môi trường (nền, tile, prop)
//   borrowedMaps? [{ root, manifest, ids }] — asset map mượn của chương khác (chỉ các
//                 ID liệt kê; trùng ID thì manifest chương thắng)
//   tiles         { ground, groundRegion, terrain? } — ID tileset mặt đất, vùng tile
//                 dùng chung, bộ tile ghép địa hình
//   farHills?     { id, parallax, bottomY, hiddenUnderSky: [id trời] }
//   mapProps      ID prop môi trường cần nạp (vật cản, vật phẩm, cổng, cờ, bia)
//   domSprites    ID ảnh DOM riêng chương (chân dung)
//   sprites       { obstacles, hazards, enemies, projectiles, npcs } — bảng ánh xạ
//                 loại -> asset/animation/hitbox (xem config.js của chương).
//                 Số máu người chơi mất mỗi lần trúng (mặc định 1): `damage` của
//                 hazards[…]/projectiles[…], `rules.damage` của enemies[…] (cú đánh).
//                 hazards[…] thêm (BT-ENGINE): `ride: { top, inset }` = bục một chiều
//                 trên lưng (voi rừng); kind `vent`: `cycle: { off, warn, active }` (giây),
//                 anims idle/warn/active; `ignoreDash` = lướt không miễn sát thương
//   item?         { sprite, fps } — vật phẩm thu thập (ô HUD + vẽ)
//   quizStele?    ID prop bia câu hỏi chặn đường
//   questions     bộ câu hỏi (stt -> câu); dialogues: thoại NPC (id -> thoại)
//   rewards       id phần thưởng -> tên (nhận khi trả lời đúng câu NPC)
//   chapterEnd    { title, text(score) } — panel hết chương
//   text          câu chữ thông báo chung (xem TEXT trong config.js của chương)
//   audio         { sfx?, music?, musicFiles? } — gộp vào bảng âm thanh engine
//   skills?       khe kỹ năng (ENGINE-01 — engine lo phím, HUD, nút cảm ứng, sở hữu;
//                 hiệu ứng do chương): { defs: { id: { slot: 'skill1'|'skill2'|null,
//                 portrait, timer(skills) -> { left, total, active } } },
//                 createState(owned), update(dt, triggered: Set<id>),
//                 onPlayerHurt?(), onAttackStart?(),
//                 attackDamage?(target) -> số | { damage, crit } — sát thương đòn chém
//                 của người chơi (chí mạng); không có = 1 }
//   enemyKinds?   { kind: { update(enemy, dt), blockStrike?(enemy) -> true = đòn bị chặn,
//                 onStruck?(enemy, damage), onContact?(enemy, player), shake?(enemy),
//                 debugLabel?(enemy, label) } } — enemy có `kind` riêng của chương
//   hooks?        { updateHud?(), keepDashing?(player), onAttackWindow?(box),
//                 onCrit?(target) — đòn chém chí mạng (chương vẽ hiệu ứng; tiếng `crit`
//                 phát nếu audio.sfx có),
//                 debugEntities?() -> [hộp], draw?: { beforeEnemies?(time),
//                 beforePlayer?(time), afterPlayer?(time) } }
//   levels        { [id]: LEVEL } — mỗi màn:
//     id, title, url, chunks, worldWidth, zones, finishX
//     gate?        { closed, open, worldX, flag? } — cổng vẽ tại worldX (null = không cổng)
//     arena?       true = đấu trường: tường 2 đầu, không về đích, camera neo tâm
//     playerStartX? mép trái hitbox người chơi lúc vào màn (mặc định PLAYER_START_X)
//     farHills?    đồi xa riêng màn (cùng dạng CHAPTER.farHills, thay cho bản của chương)
//     sprites      ID sprite canvas màn này cần nạp (ngoài sprite người chơi)
//     content(options) -> { obstacles, hazards, holes, items, enemies, npcs, quizzes, platforms?, ...thêm }
//                  (platforms: bục một chiều — entities.js makePlatform; bục lưng hazard `ride` tự thêm)
//                  (đặt địa hình bằng setTerrain/buildTerrain trước khi dựng nội dung)
//     events?(player, dt)  sự kiện riêng mỗi frame (sau câu hỏi + gặp NPC)
//     update?(dt)  chạy mỗi frame sau quân/đạn (trận boss)
//     cutscene?(dt) thay update() khi state.cutscene khác null
//     guide?       { npc, localX, story } — NPC đứng chờ nói chuyện sau cảnh vào màn
//     introMessage, introMessageTime?  thông báo nhiệm vụ đầu màn
//     testLayout?  tên layout thử `?layout=` của màn
//     skills?      true = bật khe kỹ năng (phần thưởng đã nhận) ở màn này
//     summary(state)  câu tổng kết panel qua màn
//     blockedMessage?(state)  thông báo khi chạm đích mà boss còn sống

export let CHAPTER = null;
export let LEVEL = null;

export function setChapter(definition) {
  CHAPTER = definition;
  return CHAPTER;
}

export function setLevel(id) {
  LEVEL = CHAPTER.levels[id] || CHAPTER.levels[1];
  return LEVEL;
}

// Id các màn của chương, tăng dần.
export function levelIds() {
  return Object.keys(CHAPTER.levels).map(Number).sort((a, b) => a - b);
}

export function isLastLevel(id = LEVEL.id) {
  const ids = levelIds();
  return id === ids[ids.length - 1];
}
