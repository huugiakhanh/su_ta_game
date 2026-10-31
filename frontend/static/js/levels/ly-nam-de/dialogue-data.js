// Thoại chương Lý Nam Đế — chép NGUYÊN VĂN docs/SUTA_LND_TASK_00.md §4–5 (người
// dùng duyệt 31/10/2026, Source of Truth, không tự sửa). Thoại Lý Bí dẫn màn 1
// đưa vào ở LND-L1, 3 NPC màn 2 ở LND-L2, cutscene màn 3 ở LND-L3.

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
