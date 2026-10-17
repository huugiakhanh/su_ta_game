// Thoại chương Bà Triệu — chép NGUYÊN VĂN từ docs/SUTA_BT_TASK_00.md §4–5 (người
// dùng duyệt 17/10/2026). Source of Truth: không tự sửa (rule history-content.md).

// TODO_MISSING: NPC Triệu Quốc Đạt, anh em họ Lý, Bạch Tượng + cốt truyện (§4) —
// đưa vào ở BT-L2 cùng NPC/sprite màn 2.
export const NPC_DIALOGUES = {};

// §5.3 Panel kết chương: dòng 1 (điểm) + dòng 2 (kết cục lịch sử), nối bằng dấu
// cách vì #endText hiển thị bằng textContent một đoạn.
export const CHAPTER_END = {
  title: 'Hoàn thành chương Bà Triệu',
  text: score => `Bạn đã cùng Bà Triệu đẩy lui quân Đông Ngô và đạt ${score} điểm. `
    + 'Theo sử cũ, cuộc khởi nghĩa kéo dài khoảng 5–6 tháng. Trước thế giặc mạnh, Bà Triệu tuẫn tiết ở núi Tùng '
    + '(Hậu Lộc, Thanh Hóa) khi mới 23 tuổi. Nhân dân lập đền thờ bà đến ngày nay.'
};
