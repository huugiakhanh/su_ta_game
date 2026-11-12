// Thoại chương Ngô Quyền. Nội dung đã duyệt 11/11/2026 (docs/SUTA_NQ_TASK_00.md
// §4–5) là Source of Truth, chép NGUYÊN VĂN, không tự sửa. Thoại dẫn màn 1, 3 NPC
// màn 2 và cutscene màn 3 đưa vào ở NQ-L1/L2/L3.

// Màn 2 — 3 NPC (NQ-00 §4.1–4.3, duyệt 11/11/2026): đáp án đúng đứng đầu (engine tự
// xáo khi hiện). `title` = chú thích nguyên văn Excel ô A1 + dòng chú "Hồi tưởng năm
// 937" / "Tương truyền" (NQ-L2 Q1, duyệt 12/11/2026). Khoá NPC trùng khoá pool câu
// hỏi (NPC_QUESTION_POOLS). `memorial` = chân dung trắng đen (hồi tưởng).
export const NPC_DIALOGUES = {
  // 4.1 Dương Đình Nghệ (hồi tưởng năm 937)
  duongDinhNghe: {
    name: 'Dương Đình Nghệ',
    title: 'Cha vợ, Tiết độ sứ — Hồi tưởng năm 937',
    memorial: true,
    lines: [
      'Quyền, ta có việc hệ trọng muốn hỏi.',
      'Bọn Nam Hán đang nhòm ngó phương Nam, nhưng nội bộ ta lại có kẻ gian thần Kiều Công Tiễn manh tâm phản nghịch. Ngươi tính bề nào?'
    ],
    question: 'Ngô Quyền trả lời thế nào?',
    answers: [
      'Việc nhà phải yên thì việc nước mới thành. Trước hết xuất quân diệt trừ Kiều Công Tiễn để trừ họa đâm sau lưng, cắt đứt sự tiếp ứng của giặc.',
      'Cứ để Tiễn yên, dồn sức đánh Nam Hán trước.',
      'Nhường đất cho Tiễn để tránh đổ máu.'
    ],
    hint: 'Kẻ đánh sau lưng nguy hiểm hơn kẻ đứng trước mặt.',
    why: 'Ngô Quyền đã quyết đoán tiêu diệt Kiều Công Tiễn trước khi quân Nam Hán kịp sang viện trợ, làm phá sản kế hoạch phối hợp trong ngoài của địch.',
    reward: {
      id: 'BUFF_NQ_SWIFT',
      text: 'Thần Tốc Hành Quân. Trong trận đánh, chạy nhanh hơn.'
    }
  },
  // 4.2 Kiều Công Hãn (tương truyền)
  kieuCongHan: {
    name: 'Kiều Công Hãn',
    title: 'Tướng tài, cháu nội Kiều Công Tiễn nhưng trung thành với nước — Tương truyền',
    lines: [
      'Ta là cháu Kiều Công Tiễn, nhưng lòng ta theo nước.',
      'Hoằng Tháo dẫn chiến thuyền khổng lồ tiến vào cửa biển. Thuyền ta thì nhỏ mỏng, sức quân ta có hạn, đánh giáp lá cà ắt chịu thiệt. Ta nên dùng mưu gì?'
    ],
    question: 'Ngô Quyền chọn kế nào?',
    answers: [
      'Lợi dụng thủy triều. Chặt gỗ đẽo nhọn bịt sắt cắm xuống lòng sông. Nhử địch vào sâu lúc nước lên, đợi nước rút thì dốc toàn lực phản công để thuyền địch mắc cạn và vỡ nát.',
      'Đem hết thuyền nhỏ ra biển đánh thẳng vào đội chiến thuyền.',
      'Bỏ cửa biển, rút quân lên rừng cố thủ.'
    ],
    hint: 'Nước sông lên xuống mỗi ngày. Dùng điều đó thế nào?',
    why: 'Đây là kế sách cắm cọc trên sông Bạch Đằng vĩ đại nhất lịch sử quân sự Việt Nam.',
    reward: {
      id: 'SK_NQ_IRON_STAKE',
      text: 'Cọc Sắt Bạch Đằng. Trong trận đánh, bấm K để dựng bẫy cọc dưới chân giặc.'
    }
  },
  // 4.3 Ngô Xương Ngập (tương truyền)
  ngoXuongNgap: {
    name: 'Ngô Xương Ngập',
    title: 'Con trai trưởng, Tướng tiên phong — Tương truyền',
    lines: [
      'Thưa cha, bãi cọc đã cắm xong.',
      'Kế cắm cọc đã xong, nhưng Hoằng Tháo là kẻ đa nghi, làm sao để dụ thủy quân của hắn tiến sâu vào bãi cọc lúc nước chưa rút?'
    ],
    question: 'Ngô Quyền dặn con thế nào?',
    answers: [
      'Dùng thuyền nhẹ ra khiêu chiến, đánh thua bỏ chạy. Phải diễn cho khéo để giặc cậy thế lớn mà kiêu ngạo đuổi theo, lọt vào ổ phục kích.',
      'Đốt lửa trên bãi cọc cho giặc thấy mà tránh.',
      'Đợi nước rút hẳn rồi mới ra đánh.'
    ],
    hint: 'Giặc kiêu vì thấy thuyền ta nhỏ. Làm sao cho chúng đuổi theo?',
    why: 'Sự kết hợp hoàn hảo giữa mưu kế tâm lý và yếu tố tự nhiên (thủy triều).',
    reward: {
      id: 'SK_NQ_DECOY_BOAT',
      text: 'Thuyền Nhẹ Khiêu Chiến. Trong trận đánh, bấm L để lướt nhanh và né mọi đòn trong 3 giây.'
    }
  }
};

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
