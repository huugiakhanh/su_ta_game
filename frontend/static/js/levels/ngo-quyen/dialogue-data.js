// Thoại chương Ngô Quyền. Nội dung đã duyệt 11/11/2026 (docs/SUTA_NQ_TASK_00.md
// §4–5) là Source of Truth, chép NGUYÊN VĂN, không tự sửa. Thoại dẫn màn 1, 3 NPC
// màn 2 và cutscene màn 3 đưa vào ở NQ-L1/L2/L3.

export const NPC_DIALOGUES = {};

// Ngô Quyền dẫn màn 1 (NQ-00 §5.1).
export const STORY_NQ_INTRO = {
  portrait: 'PORTRAIT_NGO_QUYEN',
  memorial: false,
  name: 'Ngô Quyền',
  lines: [
    'Ta là Ngô Quyền, người Đường Lâm, trấn giữ Ái Châu. Kiều Công Tiễn đã giết chủ tướng Dương Đình Nghệ, lại rước giặc Nam Hán vào nhà.',
    'Đường ra Bắc nhiều sông nước. Lên thuyền nhỏ ở bến, giữ vững tay chèo!'
  ]
};

// Kiều Công Tiễn khi gặp (mini-boss màn 1, NQ-00 §5.1).
export const STORY_NQ_KCT = {
  portrait: 'PORTRAIT_KIEU_CONG_TIEN',
  memorial: false,
  name: 'Kiều Công Tiễn',
  lines: ['Ngô Quyền! Quân Nam Hán sắp tới, ngươi chẳng làm gì được ta!']
};

// Panel kết chương (NQ-00 §5.3, duyệt 11/11/2026).
export const CHAPTER_END = {
  title: 'Hoàn thành chương Ngô Quyền',
  text: score => `Bạn đã cùng Ngô Quyền làm nên chiến thắng Bạch Đằng năm 938 và đạt ${score} điểm. `
    + 'Mùa xuân năm 939, Ngô Quyền xưng vương, đóng đô ở Cổ Loa, chấm dứt hơn một nghìn năm Bắc thuộc.'
};
