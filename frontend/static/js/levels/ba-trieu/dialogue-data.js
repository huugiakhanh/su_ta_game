// Thoại chương Bà Triệu — chép NGUYÊN VĂN từ docs/SUTA_BT_TASK_00.md §4–5 (người
// dùng duyệt 17/10/2026). Source of Truth: không tự sửa (rule history-content.md).

// Màn 2 — 3 NPC (§4.1–4.3): đáp án đúng đứng đầu (engine tự xáo khi hiện).
export const NPC_DIALOGUES = {
  // 4.1 Triệu Quốc Đạt — Anh trai, Hào trưởng vùng Quan Yên
  quocDat: {
    name: 'Triệu Quốc Đạt',
    title: 'Anh trai, Hào trưởng vùng Quan Yên',
    lines: [
      'Trinh, anh nghe em định vào núi Nưa tụ nghĩa quân.',
      'Em là phận gái, sao không lo việc bề gia thất, dệt vải thêu thùa mà lại muốn dấy binh đánh giặc, chuốc lấy hiểm nguy?'
    ],
    question: 'Bà Triệu đáp lời anh trai thế nào?',
    answers: [
      'Tôi chỉ muốn cưỡi cơn gió mạnh, đạp luồng sóng dữ, chém cá kình ở biển Đông, quét sạch bờ cõi, để cứu dân ra khỏi nơi đắm đuối, chứ không thèm bắt chước người đời cúi đầu cong lưng để làm tì thiếp người ta.',
      'Anh nói phải. Em sẽ ở nhà lo việc canh cửi, chờ thời thế đổi thay.',
      'Em vào rừng chỉ để săn bắn cho thoả chí, không màng việc nước.'
    ],
    hint: 'Nghĩ xem điều gì lớn hơn an nguy của riêng mình.',
    why: 'Lời khẳng định khí tiết hào hùng này đã thuyết phục hoàn toàn anh trai cùng hội quân khởi nghĩa.',
    reward: {
      id: 'BUFF_BT_CRIT',
      text: 'Chí mạng. Trong trận đánh, đòn chém đôi khi gây gấp đôi sát thương.'
    }
  },
  // 4.2 Ba anh em họ Lý (Lý Hoằng, Lý Cường, Lý Lực) — Tướng tài vùng Bồ Điền; Lý Hoằng nói
  hoLy: {
    name: 'Ba anh em họ Lý',
    title: 'Tướng tài vùng Bồ Điền',
    lines: [
      'Nghe tin nàng dấy binh, anh em chúng tôi từ Bồ Điền tìm đến.',
      'Núi Nưa hiểm trở nhưng lương thảo khó bề bám trụ lâu dài. Nếu quân Đông Ngô kéo đại binh tới vây ráp, chủ tướng sẽ lui về đâu?'
    ],
    question: 'Khi đại binh Đông Ngô kéo tới, nghĩa quân nên dựa vào đâu?',
    answers: [
      'Tiến về căn cứ Bồ Điền. Nơi đây đất trũng, sình lầy hiểm trở, thuận lợi lập chiến lũy phòng thủ vững chắc và chặn đường tiến quân của giặc.',
      'Kéo cả quân ra đồng bằng trống trải, dàn trận đánh lớn với giặc.',
      'Giải tán nghĩa quân, đợi giặc rút rồi tụ lại.'
    ],
    hint: 'Hãy tìm nơi địa thế giúp ta lấy ít địch nhiều.',
    why: 'Tầm nhìn chiến lược, biết dựa vào địa hình Bồ Điền đã thuyết phục 3 anh em họ Lý đầu quân.',
    reward: {
      id: 'SK_BT_RATTAN_SHIELD',
      text: 'Khiên mây tre. Trong trận đánh, bấm K để giơ khiên chặn tên và đòn đánh trong chốc lát.'
    }
  },
  // 4.3 Bạch Tượng — Voi trắng một ngà
  bachTuong: {
    name: 'Bạch Tượng',
    title: 'Voi trắng một ngà',
    lines: [
      '(Tiếng voi rống vang khắp núi rừng.)',
      'Ta là chúa tể núi rừng, chỉ khuất phục trước người có uy đức và sức mạnh cái thế. Ngươi làm sao để ta cúi đầu?'
    ],
    question: 'Làm sao để Bạch Tượng cúi đầu?',
    answers: [
      'Không dùng đao kiếm. Dùng sức mạnh nhảy lên lưng, vuốt ve và gióng hồi chiêng lệnh vang vọng núi rừng để hòa nhịp ý chí.',
      'Dùng giáo mác vây bắt, đánh cho voi kiệt sức rồi xích lại.',
      'Đào hố sâu bẫy voi, bỏ đói nhiều ngày cho thuần.'
    ],
    hint: 'Muôn loài phục người có uy đức, không phục kẻ tàn bạo.',
    why: 'Bà Triệu thu phục voi bằng sự oai linh và tiếng cồng chiêng vang dội.',
    reward: {
      id: 'SK_BT_WHITE_ELEPHANT',
      text: 'Gọi Bạch Tượng. Trong trận đánh, bấm L để voi trắng lao tới húc văng quân địch.'
    }
  }
};

// 4.4 Cốt truyện màn 2: hiện 1 lần khi vào chunk sau Triệu Quốc Đạt (đã gặp),
// trước khi gặp anh em họ Lý.
export const STORY_QUOC_DAT = {
  portraitNpc: 'quocDat',
  lines: [
    'Tin buồn truyền về: Triệu Quốc Đạt đã qua đời.',
    'Nghĩa quân tôn Bà Triệu lên làm chủ tướng, tiếp tục cuộc khởi nghĩa.'
  ]
};

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
