// Thoại chương Triệu Việt Vương — chép NGUYÊN VĂN từ docs/SUTA_TQP_TASK_00.md
// (Source of Truth, không tự sửa). Đã duyệt: §5.1–5.2 (TQP-L1 Q1, 04/11/2026).
// Thoại NPC màn 2, cutscene, câu kết chương còn chờ team duyệt (§4, §5.4–5.5).

// TODO_MISSING: Triệu Túc, Lý Nam Đế, Chử Đồng Tử (TQP-L2).
export const NPC_DIALOGUES = {};

// Triệu Quang Phục dẫn màn 1 (TQP-00 §5.2).
export const STORY_TQP_INTRO = {
  portrait: 'PORTRAIT_TQP',
  memorial: false,
  name: 'Triệu Quang Phục',
  lines: [
    'Ta là Triệu Quang Phục, con Thái phó Triệu Túc. Muốn đánh giặc, trước hết phải rèn võ nghệ.',
    'Hãy cùng ta luyện tập rồi theo cha ta về với Lý Bí.'
  ]
};

// Triệu Quang Phục cuối bãi tập (TQP-L1 Q2 — câu kỹ thuật, không phải nội dung lịch sử).
export const STORY_TQP_YARD = {
  portrait: 'PORTRAIT_TQP',
  memorial: false,
  name: 'Triệu Quang Phục',
  lines: ['Đã luyện xong, lên đường!']
};

// TODO_MISSING: dòng điểm + kết cục lịch sử (TQP-00 §5.5, chờ duyệt).
// Tạm chỉ báo điểm.
export const CHAPTER_END = {
  title: 'Hoàn thành chương Triệu Việt Vương',
  text: score => `Điểm: ${score}.`
};
