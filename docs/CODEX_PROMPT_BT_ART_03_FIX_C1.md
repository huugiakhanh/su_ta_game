# CODEX PROMPT — BT_ART_03_FIX_C1: kỵ binh thiết giáp `death` + nền chiến lũy (32-bit)

28/10/2026 • Người giao: team Sử Ta (Claude soạn) • Skill `$generate2dsprite` (mục 1), `$generate2dmap` (mục 2) • **Người dùng duyệt 28/10/2026**
> Trước khi làm, đọc `SUTA_TT_ART_BRIEF_32.md` và `docs/CODEX_PROMPT_BT_ART_03.md` (mục 4 và 9). Nếu prompt này mâu thuẫn với brief thì làm theo prompt này và ghi lại trong report.
> Đây là bản vá **Gate C1**. Chưa làm C2.
> `BOSS_LUC_DAN` (đã sửa ở FIX_LD), `PROP_BT_COMMAND_TOWER`, cùng 3 animation `gallop`, `blocked`, `knockback` của `EN_NGO_ARMORED_CAVALRY` đã **PASS** — không sửa.

## 0. KẾT QUẢ SOÁT (Claude, 28/10/2026)

Phần kỹ thuật của cả hai asset đều đạt:
- cỡ ảnh, alpha 0/255, baseline;
- số màu;
- chỗ nối lặp của nền: chênh lệch 7,7, trong khi chênh lệch giữa các cột bên trong có trung vị 7,5.

Asset cần vẽ lại vì sai thiết kế:

| Asset | Lỗi |
|---|---|
| `EN_NGO_ARMORED_CAVALRY.death` | Ô 1–5: ngựa **gần như không giáp** — chỉ còn tấm che cổ/ngực, mông và sườn lộ lông nâu. Trong khi đó `gallop`/`blocked`/`knockback` phủ giáp vảy kín cổ–ngực–sườn–mông. Người chơi sẽ thấy giáp "biến mất" ngay khi kỵ binh chết. Ô 4 có thêm một **cụm pixel rời 49 px ảnh** ở (101, 23) trong ô, lơ lửng trên trời. |
| `BG_BT_MID_FORTRESS` | Không đúng mục 9 của BT_ART_03. Nội dung chỉ chiếm dải thấp (từ y 334/640), gần hết là bụi cây hoa đỏ lặp đều. Cụ thể: **không có núi đá** nửa phải, **không có nước đọng/lau sậy** rõ ở nửa trái. Chiến lũy chỉ có 1 chòi nhỏ và một đoạn rào ngắn, không đọc được là "chiến lũy Bồ Điền". Dải đất có một **vạch sáng 1 px** chạy hết chiều ngang ở hàng 575 (màu 176,108,80). |

## 1. `EN_NGO_ARMORED_CAVALRY.death` — vẽ lại 6 ô

- Giữ nguyên các thông số sau:
  - 6@12, không lặp;
  - ô 96×64 → strip 2304×256;
  - pivot bottom-center, hàng chân 251, quay phải, ≤ 32 màu `palette_32_bt_a2.png`;
  - ID, tên animation, tên file.
- Ngựa và người phải **cùng một thiết kế với `gallop` ô 1**:
  - giáp vảy phủ cổ, ngực, sườn, mông, viền xanh chàm như bản hiện tại;
  - cùng mũ, giáp và thương của người cưỡi;
  - cỡ đầu/mũ người cưỡi 25–26 px ảnh như các animation khác.
- Diễn biến:
  - ô 1–2 ngựa khuỵu chân trước;
  - ô 3–4 đổ nghiêng, người cưỡi trượt xuống;
  - ô 5–6 nằm yên sát đất (ô 6 cao ≤ 24 px logic, giống đống đổ hiện tại).
- Giáp vẫn còn nguyên trên thân, **không** rụng mảnh. Mảnh giáp văng là phần riêng của `knockback`.
- Không có cụm pixel rời nào ngoài thân ngựa/người/thương. Report ghi số thành phần liên thông của từng ô; mỗi ô chỉ được 1 khối chính, tối đa thêm thương rời.

## 2. `BG_BT_MID_FORTRESS` — vẽ lại

Làm đúng mục 9 của `CODEX_PROMPT_BT_ART_03.md`. Thông số giữ nguyên:
- 768×160 → 3072×640, `anchor: bottom-at-GROUND_Y`, `tileable_x: true`;
- bảng màu `palette_map_32_bt.png`;
- trong report ghi rõ số màu thêm, tổng không quá 192.

Bố cục trong một vòng lặp 768 px logic:
- **Nửa trái — đầm lầy:** mặt nước đọng phản chiếu trời, lau sậy, cỏ nước. Cùng ngôn ngữ hình với `BG_BT_MID_MARSH`.
- **Giữa — chiến lũy của nghĩa quân**, chiếm khoảng 1/3 chiều ngang:
  - rào tre vót nhọn **2–3 lớp** chạy dài;
  - ụ đất đắp;
  - 1–2 chòi canh tre;
  - cờ trơn không chữ.
- **Nửa phải — núi đá:** vách/khối đá xám, ít cây. Cùng ngôn ngữ hình với `BG_BT_MID_ROCKY_SLOPE`. Đỉnh núi cao tới khoảng 1/2 ảnh để tạo khung đấu trường.
- **Chỗ chuyển:** núi đá nối trở lại đầm lầy ở chỗ lặp. Đo chỗ nối như QA 5.4.

Những thứ không vẽ:
- không vẽ quân, tháp vàng, đài chỉ huy (các thứ này là sprite riêng);
- không vẽ đền, chùa, công trình đá kiểu Trung Hoa;
- không vẽ bụi hoa đỏ lặp đều như bản hiện tại.

Vùng phải để trống và dải đất:
- **Không** đặt chi tiết đậm trong dải 60–110 px ảnh ngay trên `GROUND_Y` (vùng Lục Dận/kỵ binh hoạt động). Ở dải này chỉ dùng mảng tối, ít tương phản.
- Dải đất đáy không có vạch sáng chạy ngang. Hàng đáy phải đục.

## 3. ACCEPTANCE

1. Cỡ ảnh, alpha, baseline, số màu như mục 1–2. ID, animation, file, frames và fps giữ nguyên.
2. `death`: thêm GIF `preview/gate_c1/en_ngo_armored_cavalry_gallop_death.gif` gồm `gallop` ô 1 → `death` 1…6, để thấy giáp không đổi.
3. Nền:
   - chênh lệch chỗ nối ≤ p95 chênh lệch giữa các cột bên trong;
   - không lỗ trong suốt bị bao kín, không cụm vụn;
   - mockup ×1 và ×2 gồm: tileset mặt đất, `PLAYER_FEMALE`, `PROP_BT_COMMAND_TOWER` + `BOSS_LUC_DAN.command`, `EN_NGO_ARMORED_CAVALRY.gallop`;
   - nhân vật phải nổi rõ hơn nền.
4. So SHA-256: ngoài 2 file được sửa, manifest/maps (chỉ `qa_notes`) và report, không file nào khác thay đổi.

## 4. BÁO CÁO & DỪNG

- Thêm mục `BT_ART_03_FIX_C1` vào `SPRITE_REPORT_BT_32.md` (phần `death`) và `MAP_REPORT_BT_32.md` (phần nền), kèm số đo của acceptance.
- Status tối đa `NORMALIZED`.
- **Dừng, chờ team duyệt Gate C1.** Không làm C2.
