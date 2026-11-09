// Thoại chương Phùng Hưng. Nội dung đã duyệt 09/11/2026 (docs/SUTA_PH_TASK_00.md
// §4–5) là Source of Truth, chép NGUYÊN VĂN, không tự sửa. Cutscene màn 3 đưa vào
// ở PH-L3.

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

// Màn 2 — 3 NPC (PH-00 §4.1–4.3, duyệt 09/11/2026): đáp án đúng đứng đầu (engine tự
// xáo khi hiện). `title` lấy nguyên văn Excel ô A1 (PH-L2 Q1); khoá NPC trùng khoá
// pool câu hỏi (NPC_QUESTION_POOLS).
export const NPC_DIALOGUES = {
  // 4.1 Phùng Hải
  phungHai: {
    name: 'Phùng Hải',
    title: 'Em trai, sức địch ngàn người',
    lines: [
      'Anh ơi, trai làng đã tụ về đầy sân.',
      'Quân Đường đông đúc, anh em ta tuy khỏe nhưng tay không tấc sắt, làm sao chống lại giáo mác của giặc?'
    ],
    question: 'Phùng Hưng trả lời em thế nào?',
    answers: [
      'Lấy sức người bù đắp vũ khí. Ban ngày vác gỗ, ban đêm xô trâu để rèn luyện gân cốt. Biến cuốc xẻng, gậy gộc của dân cày thành vũ khí bén nhọn nhất bằng sức mạnh đoàn kết.',
      'Chờ khi nào có đủ giáo mác hẵng tính.',
      'Anh em ta về nhà làm ruộng, mặc kệ quan đô hộ.'
    ],
    hint: 'Không có giáo mác thì còn có gì trong tay dân làng?',
    why: 'Sự rèn luyện thể chất phi thường của anh em họ Phùng là nền tảng ban đầu của nghĩa quân.',
    reward: {
      id: 'BUFF_PH_POWER',
      text: 'Sức Địch Ngàn Người. Trong trận đánh, sát thương đòn đánh tăng gấp đôi.'
    }
  },
  // 4.2 Đỗ Anh Hàn
  doAnhHan: {
    name: 'Đỗ Anh Hàn',
    title: 'Mưu sĩ xuất chúng',
    lines: [
      'Ta cùng làng với ông, có một kế muốn bàn.',
      'Cao Chính Bình đang vơ vét tàn bạo, dân chúng oán thán tận trời. Nhưng Tống Bình thành cao hào sâu, nay nên dùng mưu kế gì để công phá?'
    ],
    question: 'Phùng Hưng chọn kế nào?',
    answers: [
      'Không vội đánh thẳng vào thành. Đem quân vây chặt phủ đô hộ, để giặc trong thành hoang mang mà tự suy sụp.',
      'Dồn hết quân đánh thẳng vào cổng thành ngay trong đêm nay.',
      'Gửi thư xin Cao Chính Bình giảm thuế rồi chờ.'
    ],
    hint: 'Thành cao hào sâu thì đánh thẳng sẽ tổn thất lớn.',
    why: 'Theo Cương mục, Phùng Hưng dùng kế của Đỗ Anh Hàn, đem quân vây phủ đô hộ.',
    reward: {
      id: 'SK_PH_SUPPLY_CUT',
      text: 'Khóa Lương. Trong trận đánh, bấm K để làm chậm địch.'
    }
  },
  // 4.3 Bồ Phá Cần (tương truyền)
  boPhaCan: {
    name: 'Bồ Phá Cần',
    title: 'Tướng tài kiệt xuất — Tương truyền',
    lines: [
      'Tương truyền đêm ấy, lửa cháy khắp bốn phía thành.',
      'Khi vòng vây đã khép chặt, Cao Chính Bình đóng chặt cổng thành không ra, viện binh nhà Đường có thể đến bất cứ lúc nào. Ta phải làm sao?'
    ],
    question: 'Phùng Hưng sẽ làm gì?',
    answers: [
      'Dùng kế nghi binh, ban đêm đốt lửa khắp bốn phía thành, đánh trống hò reo vang trời tạo thế trận áp đảo, dùng tâm lý chiến để bẻ gãy ý chí của giặc.',
      'Giải vây, rút quân về Đường Lâm để tránh viện binh.',
      'Cho quân nghỉ ngơi, đợi giặc tự mở cổng.'
    ],
    hint: 'Giặc đang sợ. Làm sao cho chúng sợ hơn?',
    why: 'Áp lực tâm lý đã khiến viên Đô hộ Cao Chính Bình hoảng sợ sinh bệnh mà chết.',
    reward: {
      id: 'SK_PH_FIRE_DRUM',
      text: 'Hỏa Trận Trống Đồng. Trong trận đánh, bấm L khiến quân địch hoảng loạn.'
    }
  }
};

// PH-00 §5.3.
export const CHAPTER_END = {
  title: 'Hoàn thành chương Phùng Hưng',
  text: score => `Bạn đã cùng Phùng Hưng làm chủ phủ đô hộ Tống Bình và đạt ${score} điểm. `
    + 'Sau khi ông mất, con là Phùng An tôn ông làm Bố Cái Đại Vương. Theo sử cũ, bố là cha, cái là mẹ.'
};
