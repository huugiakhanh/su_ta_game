// Thoại chương Lý Nam Đế — chép NGUYÊN VĂN docs/SUTA_LND_TASK_00.md §4–5 (người
// dùng duyệt 31/10/2026, Source of Truth, không tự sửa). 3 NPC màn 2 ở LND-L2,
// cutscene màn 3 ở LND-L3.

// TODO: Phạm Tu, Tinh Thiều, Triệu Túc (§4, LND-L2).
export const NPC_DIALOGUES = {};

// §5.4 Panel kết chương: dòng 1 (điểm) + dòng 2 (kết cục lịch sử), nối bằng dấu
// cách vì #endText hiển thị bằng textContent một đoạn.
export const CHAPTER_END = {
  title: 'Hoàn thành chương Lý Nam Đế',
  text: score => `Bạn đã cùng Lý Bí đánh đuổi quân Lương và đạt ${score} điểm. `
    + 'Mùa xuân năm 544, Lý Bí lên ngôi Hoàng đế, tức Lý Nam Đế, đặt quốc hiệu Vạn Xuân, niên hiệu Thiên Đức, '
    + 'mong đất nước mãi trường tồn như vạn mùa xuân.'
};

// Màn 1: Lý Bí chờ người chơi ở đầu màn (NPC dẫn — engine LEVEL.guide).
// Nguyên văn docs/SUTA_LND_TASK_00.md §5.2 (người dùng duyệt 31/10/2026).
export const STORY_LY_BI_INTRO = {
  portrait: 'PORTRAIT_LY_BI',
  memorial: false,
  name: 'Lý Bí',
  lines: [
    'Ta từng làm Giám quân ở Đức Châu, nhưng không chịu nổi sự tàn bạo, tham nhũng của Tiêu Tư nên đã từ quan về quê.',
    'Nay ta chiêu binh mãi mã. Hãy theo ta vượt qua đồi núi, xuống đồng bằng Giao Châu tập hợp lực lượng.'
  ]
};
