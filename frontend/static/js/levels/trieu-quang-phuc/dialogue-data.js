// Thoại chương Triệu Việt Vương — chép NGUYÊN VĂN từ docs/SUTA_TQP_TASK_00.md
// (Source of Truth, không tự sửa). Đã duyệt: §5.1–5.2 (TQP-L1 Q1, 04/11/2026),
// §4 thoại NPC màn 2 (team duyệt, người dùng báo 05/11/2026). Cutscene, câu kết
// chương còn chờ team duyệt (§5.4–5.5) — đang dùng bản nháp (TQP-L3 Q6).

// Màn 2 — 3 NPC (§4.1–4.3): đáp án đúng đứng đầu (engine tự xáo khi hiện).
// name/title tách từ tiêu đề mục §4.x (phần trong ngoặc = title).
export const NPC_DIALOGUES = {
  // 4.1 Thái phó Triệu Túc (cha Triệu Quang Phục)
  trieuTuc: {
    name: 'Thái phó Triệu Túc',
    title: 'cha Triệu Quang Phục',
    lines: [
      'Con ta, quân Lương đã đến sát Chu Diên. Cha muốn xem con cầm quân thế nào.',
      'Quân Lương do Trần Bá Tiên chỉ huy thế giặc đang rất mạnh, quân ta mới thua trận. Là người lãnh đạo, con chọn cách đánh nào?'
    ],
    question: 'Triệu Quang Phục chọn cách đánh nào?',
    answers: [
      'Rút lui về vùng đầm lầy hiểm trở Dạ Trạch, tránh thế giặc mạnh, bảo toàn lực lượng.',
      'Dàn quân đánh trực diện một trận quyết thắng với quân Lương.',
      'Giải tán nghĩa quân, ai về nhà nấy chờ thời.'
    ],
    hint: 'Giặc đang mạnh, ta vừa thua. Trước hết phải giữ được lực lượng.',
    why: 'Đánh trực diện sẽ tiêu vong. Rút lui chiến lược là nền tảng của chiến thắng.',
    reward: {
      id: 'BUFF_TQP_VITALITY',
      text: 'Thể lực cường tráng. Trong trận đánh, máu tối đa tăng thêm 2.'
    }
  },
  // 4.2 Lý Nam Đế (Lý Bí — Quân vương). `why` giữ nguyên văn đã duyệt; nghi vấn
  // "Dạ Trạch Vương" chờ team (TQP-00 mục 7 dòng 5).
  lyNamDe: {
    name: 'Lý Nam Đế',
    title: 'Lý Bí — Quân vương',
    lines: [
      'Ta đã lui về động Khuất Lão. Việc chống giặc, nay trông cả vào khanh.',
      'Bệnh tình ta đã trở nặng, vận nước ngàn cân treo sợi tóc. Nếu ta trao lại binh quyền, điều đầu tiên khanh làm để yên lòng quân là gì?'
    ],
    question: 'Triệu Quang Phục sẽ làm gì?',
    answers: [
      'Xưng vương, dựng cờ phục quốc, lấy nhân nghĩa và kỷ luật để thu phục lòng dân cùng tàn quân khắp nơi.',
      'Ở lại động Khuất Lão chờ bệ hạ khỏi bệnh rồi mới tính.',
      'Cầu hoà với nhà Lương cho quân sĩ nghỉ ngơi.'
    ],
    hint: 'Quân đang như rắn mất đầu. Cần có người đứng ra quy tụ.',
    why: 'Trong lúc rắn mất đầu, cần một danh chính ngôn thuận (Triệu Việt Vương) để quy tụ ý chí chiến đấu.',
    reward: {
      id: 'SK_TQP_RALLY',
      text: 'Hiệu triệu Vạn Xuân. Trong trận đánh, bấm K tung đòn quét quanh mình, hạ quân nhỏ xung quanh.'
    }
  },
  // 4.3 Chử Đồng Tử (Nhân vật huyền thoại — Đạo sĩ hiển linh)
  chuDongTu: {
    name: 'Chử Đồng Tử',
    title: 'Nhân vật huyền thoại — Đạo sĩ hiển linh',
    lines: [
      'Lòng ngươi vì nước vì dân, nên ta hiện về giúp sức.',
      'Kẻ địch đông gấp chục lần, trang bị tận răng đóng ngoài cửa đầm. Ngươi dùng gì để phá giặc?'
    ],
    question: 'Triệu Quang Phục dùng gì để phá giặc?',
    answers: [
      'Thuận theo tự nhiên. Ban ngày tĩnh lặng ẩn nấp, ban đêm dùng thuyền độc mộc xuất quỷ nhập thần tập kích doanh trại địch.',
      'Dồn hết quân ra cửa đầm, quyết tử một trận giữa ban ngày.',
      'Đắp thành cao giữa đầm, cố thủ chờ giặc tự rút.'
    ],
    hint: 'Dạ Trạch có lau sậy rậm và đêm tối. Hãy dựa vào đó.',
    why: 'Đây chính là chiến thuật du kích làm nên tên tuổi Triệu Quang Phục.',
    reward: {
      id: 'SK_TQP_DRAGON_CLAW',
      text: 'Móng Rồng. Trong trận đánh, bấm L để đòn đánh mang sức mạnh rồng, chém xuyên giáp Dương Sàn.'
    }
  }
};

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

// Cutscene màn 3 — nguyên văn TQP-00 §5.4 (BẢN NHÁP, CHỜ TEAM DUYỆT — dùng tạm
// theo TQP-L3 Q6). Câu 1 lệch Toàn thư (chỉ ghi Dương Sàn "chống đánh, thua rồi
// chết", không nói Triệu Quang Phục tự tay giết) — chờ team chốt.
export const STORY_TQP_FINISH = {
  portrait: 'PORTRAIT_TQP',
  memorial: false,
  lines: ['Triệu Quang Phục tung đòn kết liễu. Tướng giặc Dương Sàn tử trận.']
};

export const STORY_TQP_VICTORY = {
  portrait: 'PORTRAIT_TQP',
  memorial: false,
  lines: ['Quân Lương tan vỡ, nghĩa quân Dạ Trạch tiến về Long Biên.']
};

// Panel kết chương — nguyên văn TQP-00 §5.5 (BẢN NHÁP, CHỜ TEAM DUYỆT — dùng tạm
// theo TQP-L3 Q6). Dòng 2 lấy từ giải thích câu 19, 20, 21.
export const CHAPTER_END = {
  title: 'Hoàn thành chương Triệu Việt Vương',
  text: score => `Bạn đã cùng Triệu Quang Phục đánh tan quân Lương và đạt ${score} điểm. `
    + 'Năm 550, Triệu Quang Phục chém tướng Dương Sàn, xưng Triệu Việt Vương, khôi phục nước Vạn Xuân và đóng đô ở Long Biên.'
};
