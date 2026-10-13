// TT-HERO-01 (13/10/2026): người chơi là nghĩa sĩ nam/nữ do Trưng Trắc phái đi,
// không còn là Trưng Trắc. Chỉ đổi lời xưng hô trong `lines` (và `title` Trưng
// Nhị) theo yêu cầu người dùng; câu hỏi, đáp án, gợi ý, giải thích giữ nguyên
// TT-NPC-01. Xưng "ngươi" / "nghĩa sĩ" để dùng chung cho nam và nữ.
export const NPC_DIALOGUES = {
  // 5.1 Thi Sách — Hào trưởng Chu Diên
  thiSach: {
    name: 'Thi Sách',
    title: 'Hào trưởng Chu Diên',
    lines: [
      'Ngươi là nghĩa sĩ Trưng Trắc sai tới? Tô Định vừa sai người tới dụ ta quy hàng.',
      'Chúng dọa nếu ta cùng Trắc chống lại, sẽ giết cả họ ta và bá tánh Chu Diên.'
    ],
    question: 'Trước lời đe dọa của giặc, người làm tướng nên chọn con đường nào?',
    answers: [
      'Lấy đại nghĩa làm trọng, không cúi đầu trước giặc, cùng dựng cờ cứu dân.',
      'Tạm quy hàng để giữ yên cho gia tộc, chờ thời cơ.',
      'Bỏ vào rừng sâu lánh nạn, mặc cho dân chúng chịu khổ.'
    ],
    hint: 'Nghĩ xem điều gì giúp muôn dân thoát ách đô hộ.',
    why: 'Sử cũ chép rằng Thi Sách không chịu khuất phục trước Tô Định. Nợ nước, thù nhà đã hun đúc ý chí khởi nghĩa của Trưng Trắc.',
    reward: {
      id: 'BUFF_Y_CHI_KIEN_CUONG',
      text: 'Ý chí kiên cường. Khi máu chỉ còn 1, nếu tránh được đòn trong 3 giây, bạn sẽ hồi 1 máu.'
    }
  },
  // 5.2 Lê Chân — Nữ tướng vùng biển An Biên
  leChan: {
    name: 'Lê Chân',
    title: 'Nữ tướng vùng biển An Biên',
    lines: [
      'Quân Hán đông, giáp trụ tốt. Đánh nhau trên đất bằng, ta khó thắng.',
      'Nhưng người vùng ta giỏi sông nước. Nghĩa sĩ, theo ngươi ta nên chuẩn bị lực lượng thế nào?'
    ],
    question: 'Lê Chân nên chuẩn bị lực lượng ra sao để hưởng ứng Hai Bà?',
    answers: [
      'Lập căn cứ ven biển, chiêu mộ trai tráng, luyện thủy quân và khai hoang lấy lương nuôi quân.',
      'Dồn toàn bộ quân ra đánh ngay trên đồng bằng.',
      'Gửi thư cầu hòa với Thái thú để giữ yên vùng biển.'
    ],
    hint: 'Hãy dựa vào thế mạnh riêng và chuẩn bị cho cuộc chiến lâu dài.',
    why: 'Theo truyền thuyết, Lê Chân lập căn cứ ở vùng ven biển An Biên (nay thuộc Hải Phòng), khai hoang và luyện quân, rồi đem lực lượng về hưởng ứng khởi nghĩa Hai Bà Trưng.',
    reward: {
      id: 'SK_LE_CHAN_ARROW_RAIN',
      text: 'Mưa tên. Trong trận đánh, bấm K để gọi mưa tên đánh kẻ địch phía trước.'
    }
  },
  // 5.3 Trưng Nhị — Em gái, cánh tay phải
  trungNhi: {
    name: 'Trưng Nhị',
    title: 'Em gái Trưng Trắc, cánh tay phải',
    lines: [
      'Nghĩa sĩ, ngươi về kịp lúc! Các Lạc tướng đã tụ về cửa sông Hát.',
      'Họ đang chờ xem chị ta nói gì trước khi vác giáo theo.'
    ],
    question: 'Điều gì quan trọng nhất để các Lạc tướng một lòng đi theo?',
    answers: [
      'Một lời thề xuất quân rõ ràng: đền nợ nước, trả thù nhà, khôi phục nghiệp xưa họ Hùng.',
      'Hứa chia hết cống phẩm vàng bạc cho mọi người.',
      'Giữ kín mục tiêu để giặc không biết.'
    ],
    hint: 'Người ta theo nhau vì chính nghĩa, không vì của cải.',
    why: 'Theo truyền thống, Trưng Trắc làm lễ thề ở cửa sông Hát (Hát Môn). Lời thề được lưu truyền qua sách đời sau, mở đầu bằng câu: "Một xin rửa sạch nước thù".',
    reward: {
      id: 'SK_TRUNG_NHI_SHADOW',
      text: 'Bóng Trưng Nhị. Trong trận đánh, bấm L để Trưng Nhị cùng xuất trận, sát thương tăng gấp đôi.'
    }
  }
};

// ---- Màn 1: Trưng Trắc gặp người chơi ở đầu màn (TT-HERO-01) ----
// `name` hiện trên khung hội thoại. Claude soạn 13/10/2026 theo yêu cầu người
// dùng, dựa trên tư liệu (Toàn thư / Việt sử lược: Tô Định tàn bạo, hãm hại
// Lạc tướng; Mê Linh; Luy Lâu là trị sở). Chi tiết nhiệm vụ (binh thư, kiệu
// quan, cổng Luy Lâu) là cốt truyện game, không phải sử liệu.
export const STORY_TRUNG_TRAC_INTRO = {
  portrait: 'PORTRAIT_TRUNG_TRAC',
  memorial: false,
  name: 'Trưng Trắc',
  lines: [
    'Ngươi là người làng bên tìm về Mê Linh, xin theo nghĩa quân phải không?',
    'Thái thú Tô Định tham lam, tàn bạo. Dân phải nộp cống nặng nề, Lạc tướng nào trái ý đều bị hắn hãm hại.',
    'Chị em ta đang tụ nghĩa binh. Nhưng muốn đánh thành giặc, nghĩa quân phải có binh thư.',
    'Hãy vượt các ải canh của quân Hán, tìm lại 5 bó thẻ tre binh thư, rồi hạ tên quan ngồi kiệu trấn giữ đường tới Luy Lâu.',
    'Đi đi, nghĩa sĩ. Non sông họ Hùng đang chờ ngươi!'
  ]
};

// ---- Màn 3 "Trận Luy Lâu" (task card TT-BOSS-01 mục 5.3–5.4, nguyên văn) ----
// Cutscene kết chương: `portrait` = asset chân dung trong manifest, `memorial:
// false` = chân dung MÀU (khác cốt truyện Thi Sách).
export const STORY_TO_DINH_FLEES = {
  portrait: 'PORTRAIT_TO_DINH',
  memorial: false,
  lines: [
    'Bị đánh văng kiếm, Tô Định hoảng sợ bỏ chạy.',
    'Sử cũ chép rằng hắn cắt tóc, cạo râu, trà trộn vào đám đông trốn về Nam Hải.'
  ]
};

export const STORY_LUY_LAU_VICTORY = {
  portrait: 'PORTRAIT_TRUNG_TRAC',
  memorial: false,
  lines: [
    'Nghĩa quân làm chủ thành Luy Lâu. Theo sử cũ, nghĩa quân đã lấy được 65 thành.',
    'Trưng Trắc được tôn làm vua, đóng đô ở Mê Linh.'
  ]
};

// Panel kết chương (mục 5.4).
export const CHAPTER_END = {
  title: 'Hoàn thành chương Trưng Trắc',
  text: score => `Bạn đã cùng Hai Bà Trưng giành lại non sông và đạt ${score} điểm.`
};

// 5.4 Cốt truyện — Thi Sách hy sinh (panel dùng PORTRAIT_THI_SACH trắng đen).
export const STORY_THI_SACH = {
  portraitNpc: 'thiSach',
  lines: [
    'Tin dữ truyền về: Tô Định đã sát hại Thi Sách.',
    'Nợ nước chồng thêm thù nhà. Trưng Trắc quyết dựng cờ khởi nghĩa.'
  ]
};
