// Hằng số chung của engine màn chơi — dùng cho MỌI chương. Không chứa logic,
// không chứa dữ liệu riêng chương (vùng cảnh, quân địch, boss... nằm ở
// `js/levels/<chương>/config.js`, engine đọc qua CHAPTER — xem chapter.js).

// Độ phân giải LOGIC của màn (TT-INT-01): mọi thứ vẽ lên canvas cao 270 rồi
// phóng ra màn hình (xem fitCanvas() trong render/canvas.js). Mọi toạ độ/kích
// thước/tốc độ dưới đây là pixel logic — đã quy đổi từ hệ cũ 896x360 theo hệ
// số k = 0.6 (xem docs/archive/INTEGRATION_PLAN_TT.md). Hằng số tính theo
// giây KHÔNG nhân k.
// Chiều CAO logic cố định; chiều RỘNG khung nhìn (VIEW_W) giãn theo tỉ lệ cửa
// sổ để màn chơi phủ kín chiều ngang (yêu cầu team 26/09): tối thiểu LOGICAL_W
// (16:9 — cửa sổ hẹp/dọc giữ như cũ), tối đa MAX_VIEW_W. fitCanvas() đặt lại
// VIEW_W qua setViewWidth(); `export let` là live-binding nên các module khác
// import VIEW_W luôn đọc giá trị mới.
export const LOGICAL_W = 480;
export const LOGICAL_H = 270;
export const MAX_VIEW_W = 640; // DESIGN_BASELINE (~2.37:1, màn siêu rộng thì có viền 2 bên)
export let VIEW_W = LOGICAL_W;
export const VIEW_H = LOGICAL_H;
export function setViewWidth(width) {
  VIEW_W = width;
}
export const CHUNK_W = 768;
// Mặt sàn vật lý = mép trên hàng tile `surface` của tileset mặt đất (TT-MAP-01):
// tile surface 16px (248–264) + 6px tile fill (264–270, bị cắt ở đáy khung).
// Manifest map của chương phải có `stage.ground_y` bằng số này (assets.js cảnh báo nếu lệch).
export const GROUND_Y = 248;
export const FOOT_MARGIN = 5;
export const MOVE_SPEED = 168;
export const GRAVITY = 1320;
export const JUMP_FORCE = 468;
export const DASH_SPEED = 432;
export const DASH_TIME = 0.30;
// Hồi chiêu lướt, tính từ lúc bắt đầu cú lướt (DESIGN_BASELINE — team 27/09).
export const DASH_COOLDOWN = 2;
export const GROUND_SNAP_DISTANCE = 11;
// Máu đầy khi bắt đầu màn (DESIGN_BASELINE).
export const MAX_HEALTH = 5;

// Đòn đánh của người chơi (giây). Animation attack_01 (6 ô) trải trên đúng
// ATTACK_COOLDOWN; cửa sổ gây sát thương (`attacking`) dài ATTACK_ACTIVE_TIME,
// BẮT ĐẦU tại ô hit_frame của manifest (ô 3 -> 2/6 x .36 = .12s sau khi bấm).
export const ATTACK_COOLDOWN = 0.36;
export const ATTACK_ACTIVE_TIME = 0.18;
// Thời gian giữ animation trúng đòn (giây). Ngắn hơn thời gian bất tử (1.25s)
// để nhân vật quay lại tư thế thường trong lúc vẫn còn nhấp nháy miễn thương.
export const HURT_ANIMATION_TIME = 0.45;

// ---- Asset dùng chung mọi chương (ENGINE-01) ----
// Nhân vật nam/nữ + icon HUD nằm ở images/shared/, manifest riêng
// (manifest_shared.json — cùng định dạng manifest chương). assets.js nạp cả hai
// manifest; ID không được trùng giữa manifest chung và manifest chương.
export const SHARED_SPRITE_ROOT = '/static/assets/images/shared/sprites-32bit/';
export const SHARED_MANIFEST_FILE = 'manifest_shared.json';
// Icon ô Lướt trên HUD (Codex 27/09 — team duyệt, IN_GAME). Thiếu asset thì ui.js hiện chữ tạm "»".
export const DASH_ICON = 'ICON_SK_DASH';
// Icon nút cảm ứng ĐÁNH (TT-MOBILE-01, Codex 29/09, IN_GAME) — chỉ dùng cho nút, thiếu thì chữ tạm.
export const ATTACK_ICON = 'ICON_SK_ATTACK';
// Icon máu HUD (TT-HIBIT-02, người dùng duyệt 02/10); thiếu thì ui.js hiện chữ ♥.
export const HEART_ICON = 'ICON_HUD_HEART';
// Ảnh DOM (<img>) chung, nạp ở mọi màn (nhỏ). Ảnh DOM riêng chương (chân
// dung) khai báo ở CHAPTER.domSprites.
export const SHARED_DOM_SPRITES = [DASH_ICON, ATTACK_ICON, HEART_ICON];
// Icon vàng (SUTA-DB-01): ảnh chung toàn web (không thuộc manifest nào) — panel qua
// màn "+N vàng"; trang chủ dùng cùng ảnh qua CSS .res-icon--gold.
export const GOLD_ICON_URL = '/static/assets/images/icon/icon_gold.png';

// Nhân vật người chơi nam/nữ (TT-HERO-01): nghĩa sĩ dùng chung mọi chương, giới
// tính tài khoản, khách tự chọn (hero.js). Ô 48x48, pivot bottom-center, quay
// phải, cùng tên + số ô animation (PLAYER_ANIMATIONS).
export const PLAYER_SPRITES = { male: 'PLAYER_MALE', female: 'PLAYER_FEMALE' };
export let PLAYER_SPRITE_ID = PLAYER_SPRITES.female;
// main.js gọi khi biết giới tính, rồi đưa PLAYER_SPRITE_ID cho loadAssets().
export function setPlayerGender(gender) {
  PLAYER_SPRITE_ID = PLAYER_SPRITES[gender] || PLAYER_SPRITES.female;
}
// Hitbox người chơi (px logic) + điểm xuất phát mặc định (mép trái hitbox);
// màn đấu trường đặt `playerStartX` riêng.
export const PLAYER_SIZE = { w: 25, h: 42 };
export const PLAYER_START_X = 84;
// Cảnh vào màn (TT-HERO-01, DESIGN_BASELINE): người chơi tự chạy từ startX
// (ngoài mép trái) tới điểm xuất phát của màn với tốc độ walkSpeed (px/s), không
// nhận phím, không tính giờ. Màn có `guide` thì NPC đó đứng chờ nói chuyện.
// Chỉ lần vào màn đầu tiên — chơi lại (R) vào thẳng.
export const INTRO = { startX: -40, walkSpeed: 120 };

// Nhân vật chính: trạng thái gameplay -> animation trong manifest
// (PLAYER_SPRITE_ID). Thứ tự ưu tiên hurt > dash > attack > jump > run > idle
// nằm ở playerAnimationState() (player.js).
//   duration: trải strip trên đúng số giây này thay vì fps của manifest.
//   byVelocity: chọn ô theo vận tốc dọc (lên / gần đỉnh / rơi), không theo giờ.
//   holdFrame: đứng yên ở 1 ô cố định (-1 = ô cuối).
// dash: 4 ô, không lặp (16fps = .25s < DASH_TIME .30s) -> đứng ở ô cuối tới hết cú lướt.
// death chỉ phát khi thua (endGame(false) ghi player.deathTime).
export const PLAYER_ANIMATIONS = {
  idle: { anim: 'idle' },
  run: { anim: 'run' },
  jump: { anim: 'jump', byVelocity: true },
  attack: { anim: 'attack_01', duration: ATTACK_COOLDOWN },
  hurt: { anim: 'hurt' },
  dash: { anim: 'dash' },
  death: { anim: 'death' },
  // Cutscene kết chương: phát 1 lần, giữ ô cuối.
  victory: { anim: 'victory' }
};
// Ngưỡng vận tốc dọc (px logic/s) chọn ô `jump`: vy < -N ô 1 (bật lên),
// |vy| <= N ô 2 (gần đỉnh), vy > N ô 3 (rơi). DESIGN_BASELINE.
export const PLAYER_JUMP_APEX_VY = 90;

// ---- Map ----
// Lớp nền từ xa đến gần (parallax DESIGN_BASELINE; bản cũ: 0.22 trời / 0.58 lớp giữa / 1.0 đất).
export const SKY_PARALLAX = 0.05;
export const MID_PARALLAX = 0.5; // đáy ảnh lớp giữa ở GROUND_Y
export const SKY_FALLBACK_COLOR = '#43b8e3';
export const GROUND_FALLBACK_COLOR = '#795238';
// Lớp giữa + trời hoà dần trong ZONE_BLEND_WIDTH px TRƯỚC mỗi ranh giới vùng,
// tính theo tâm khung nhìn (cameraX + VIEW_W/2) — hoà xong đúng lúc tâm khung
// nhìn chạm ranh giới (quyết định team G3).
export const ZONE_BLEND_WIDTH = 192; // DESIGN_BASELINE
// Tỉ lệ cột tile mặt đất có decor (cỏ, lau...) — chọn tất định theo cột.
export const GROUND_DECOR_DENSITY = 0.25; // DESIGN_BASELINE

// Địa hình ô vuông (TT-TERRAIN-01): mỗi chunk vẽ bằng lưới chữ ('#' đất, '.'
// trống), mỗi ô TERRAIN_CELL px = đúng 1 tile mặt đất; hàng dưới cùng là mặt
// đất GROUND_Y, mỗi hàng trên cao thêm 1 ô; '.' ở hàng dưới cùng = hố. Chỉ có
// bậc cao/thấp (đất liền từ đáy lên, không bục lơ lửng). Đọc qua geometry.js
// (groundYAt / terrainLevelAt). Nhảy cao tối đa JUMP_FORCE² / (2·GRAVITY) ≈
// 83px ≈ 5 ô -> bậc chênh quá TERRAIN_MAX_STEP ô thì cảnh báo (DESIGN_BASELINE).
export const TERRAIN_CELL = 16;
export const TERRAIN_MAX_STEP = 3; // DESIGN_BASELINE
// 12 vai trò của bộ tile ghép địa hình (sheet riêng của chương, 1 tile/vai trò).
// Ghép tự động theo độ cao cột (terrainTileRole ở render/terrain.js).
export const TERRAIN_TILE_ROLES = [
  'corner-left', 'surface', 'corner-right', 'corner-single',
  'wall-left', 'fill', 'wall-right', 'wall-single',
  'inner-left', 'inner-right', 'pit-top', 'pit-deep'
];

// ---- Đạn, vật phẩm ----
export const PROJECTILE_SPEED = 198;
// Tầm bay tối đa của đạn (px tính từ điểm bắn). Bay hết tầm thì đạn tan —
// ≈1.4s ở PROJECTILE_SPEED. Để hơi lớn hơn fireRange (240–258) để đạn vẫn tới
// được người chơi đứng ở mép tầm bắn. Đoạn cuối PROJECTILE_FADE_RANGE mờ dần
// thay vì biến mất đột ngột.
export const PROJECTILE_MAX_RANGE = 276;
export const PROJECTILE_FADE_RANGE = 54;
// Hazard chạy khỏi tầm nhìn phía sau người chơi bao nhiêu px thì xoá khỏi
// state (tránh mảng phình to vô hạn khi chơi lâu).
export const HAZARD_DESPAWN_MARGIN = 312;
// Vật phẩm thu thập (chương Trưng Trắc: bình thư): hitbox nhặt 22x26 (cố ý lớn
// hơn hình — dễ nhặt), nhấp nhô ±ITEM_BOB_AMPLITUDE px.
export const ITEM_HITBOX = { w: 22, h: 26 };
export const ITEM_BOB_AMPLITUDE = 3;

// ---- NPC, câu hỏi (DESIGN_BASELINE) ----
//   talkDistance  khoảng trống từ mép phải người chơi tới tâm NPC để mở hội thoại.
//   holdGap       NPC chưa gặp xong thì mép phải người chơi bị giữ cách tâm NPC
//                 chừng này (như cổng đích giữ người chơi).
//   fadeTime      gặp xong NPC mờ dần trong chừng này giây rồi biến mất.
//   w, h          hộp F2 của NPC (không va chạm).
//   clearance     không đặt vật cản trong vòng này quanh tâm NPC (entities.js kiểm tra).
export const NPC_RULES = { talkDistance: 32, holdGap: 12, fadeTime: 0.8, w: 22, h: 42, clearance: 96 };
// Giải cứu NPC (TT-L2-HARD, DESIGN_BASELINE): mỗi NPC bị lính canh vây —
// còn lính vây sống thì vẫn bị giữ trước NPC nhưng KHÔNG mở hội thoại.
//   left/right   tâm 2 lính vây so với tâm NPC; patrol = đoạn tuần tra
//                [min, max] (so với tâm NPC) — đủ với tới chỗ người chơi bị giữ.
//   hintRange    người chơi cách NPC ≤ khoảng này thì nhắc hạ lính vây;
//   hintInterval nhắc lại tối đa 1 lần mỗi khoảng này (giây).
export const NPC_RESCUE = {
  left: { dx: -100, patrol: [-170, -30] },
  right: { dx: 48, patrol: [-60, 80] },
  hintRange: 200, hintInterval: 4
};
// Điểm câu hỏi NPC (D14): đúng ngay lần đầu / đúng sau khi đã chọn sai.
export const QUESTION_SCORE = { firstTry: 500, retry: 250 }; // DESIGN_BASELINE
// Câu hỏi chặn đường (TT-QUIZ-01): trả lời 1 lần — đúng +QUIZ_SCORE, sai −1 máu.
export const QUIZ_SCORE = 500; // DESIGN_BASELINE
