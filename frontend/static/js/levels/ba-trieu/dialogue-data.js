// Thoại chương Bà Triệu — chép NGUYÊN VĂN từ docs/SUTA_BT_TASK_00.md §4–5 (người
// dùng duyệt 17/10/2026). Source of Truth: không tự sửa (rule history-content.md).

// TODO_MISSING: NPC Triệu Quốc Đạt, anh em họ Lý, Bạch Tượng + cốt truyện (§4) —
// đưa vào ở BT-L2 cùng NPC/sprite màn 2.
export const NPC_DIALOGUES = {};

// Màn 1: Bà Triệu chờ người chơi ở đầu màn (NPC dẫn — engine LEVEL.guide).
// Nguyên văn docs/SUTA_BT_TASK_L1_01.md §3 (người dùng duyệt 17/10/2026).
export const STORY_BA_TRIEU_INTRO = {
  portrait: 'PORTRAIT_BA_TRIEU',
  memorial: false,
  name: 'Bà Triệu',
  lines: [
    'Ngươi từ làng Quan Yên tìm lên núi Nưa, muốn theo nghĩa quân phải không?',
    'Quan lại Đông Ngô tham tàn, cướp bóc dân lành, bắt dân nộp thuế nặng.',
    'Ta muốn tụ nghĩa binh. Nhưng muốn đánh giặc, nghĩa quân phải có Quyển Sách Tinh Hoa.',
    'Hãy vượt rừng nứa, rừng thiêng, tìm đủ 5 Quyển Sách Tinh Hoa, rồi hạ tên tham quan thu thuế chặn đường tới doanh trại.',
    'Đi đi, nghĩa sĩ. Ta chờ ngươi ở núi Nưa!'
  ]
};

// §5.3 Panel kết chương: dòng 1 (điểm) + dòng 2 (kết cục lịch sử), nối bằng dấu
// cách vì #endText hiển thị bằng textContent một đoạn.
export const CHAPTER_END = {
  title: 'Hoàn thành chương Bà Triệu',
  text: score => `Bạn đã cùng Bà Triệu đẩy lui quân Đông Ngô và đạt ${score} điểm. `
    + 'Theo sử cũ, cuộc khởi nghĩa kéo dài khoảng 5–6 tháng. Trước thế giặc mạnh, Bà Triệu tuẫn tiết ở núi Tùng '
    + '(Hậu Lộc, Thanh Hóa) khi mới 23 tuổi. Nhân dân lập đền thờ bà đến ngày nay.'
};
