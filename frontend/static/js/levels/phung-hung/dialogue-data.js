// Thoại chương Phùng Hưng. Nội dung đã duyệt 09/11/2026 (docs/SUTA_PH_TASK_00.md
// §4–5) là Source of Truth, chép NGUYÊN VĂN, không tự sửa. Thoại 3 NPC màn 2 và
// cutscene màn 3 đưa vào ở PH-L2/L3.

// Phùng Hưng dẫn màn 1 (PH-00 §5.1).
export const STORY_PH_INTRO = {
  portrait: 'PORTRAIT_PHUNG_HUNG',
  memorial: false,
  name: 'Phùng Hưng',
  lines: [
    'Ta là Phùng Hưng, người Đường Lâm. Quan đô hộ Cao Chính Bình thu thuế nặng, dân làng khốn khổ.',
    'Tương truyền hổ dữ quen vồ bù nhìn rơm. Hãy nhử nó tới, giữ J rồi thả để tung đòn gồng!'
  ]
};

// Phùng Hải, Đỗ Anh Hàn, Bồ Phá Cần (PH-00 §4) — đưa vào ở PH-L2.
export const NPC_DIALOGUES = {};

// PH-00 §5.3.
export const CHAPTER_END = {
  title: 'Hoàn thành chương Phùng Hưng',
  text: score => `Bạn đã cùng Phùng Hưng làm chủ phủ đô hộ Tống Bình và đạt ${score} điểm. `
    + 'Sau khi ông mất, con là Phùng An tôn ông làm Bố Cái Đại Vương. Theo sử cũ, bố là cha, cái là mẹ.'
};
