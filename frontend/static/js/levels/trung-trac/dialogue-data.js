// Nội dung màn 2 "Chiêu mộ hiền tài" — SOURCE OF TRUTH: task card TT-NPC-01
// mục 5 (docs/SUTA_TT_TASK_NPC_01.md). Chép NGUYÊN VĂN, không viết lại, không
// thêm chi tiết; nghi sai thì hỏi team. Tách riêng file để đối chiếu từng chữ.
// Tên người nói hiện ở tiêu đề khung hội thoại nên `lines` bỏ tiền tố
// "Thi Sách: " và cặp ngoặc kép bao ngoài câu thoại (chữ trong câu giữ nguyên).
// Đáp án đầu tiên của mỗi câu hỏi là đáp án ĐÚNG (dialogue.js xáo thứ tự khi hiện).

export const NPC_DIALOGUES = {
  // 5.1 Thi Sách — Hào trưởng Chu Diên
  thiSach: {
    name: 'Thi Sách',
    title: 'Hào trưởng Chu Diên',
    lines: [
      'Trắc, Tô Định vừa sai người tới dụ ta quy hàng.',
      'Chúng dọa nếu ta cùng nàng chống lại, sẽ giết cả họ ta và bá tánh Chu Diên.'
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
      'Nhưng người vùng ta giỏi sông nước. Nàng muốn ta chuẩn bị lực lượng thế nào?'
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
    title: 'Em gái, cánh tay phải',
    lines: [
      'Chị ơi, các Lạc tướng đã tụ về cửa sông Hát.',
      'Họ đang chờ xem chị nói gì trước khi vác giáo theo.'
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

// 5.4 Cốt truyện — Thi Sách hy sinh (panel dùng PORTRAIT_THI_SACH trắng đen).
export const STORY_THI_SACH = {
  portraitNpc: 'thiSach',
  lines: [
    'Tin dữ truyền về: Tô Định đã sát hại Thi Sách.',
    'Nợ nước chồng thêm thù nhà. Trưng Trắc quyết dựng cờ khởi nghĩa.'
  ]
};
