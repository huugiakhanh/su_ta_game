// Thoại chương Lý Nam Đế — chép NGUYÊN VĂN docs/SUTA_LND_TASK_00.md §4–5 (người
// dùng duyệt 31/10/2026, Source of Truth, không tự sửa). Cutscene màn 3 ở LND-L3.

// Màn 2 — 3 NPC (§4.1–4.3): đáp án đúng đứng đầu (engine tự xáo khi hiện).
export const NPC_DIALOGUES = {
  // 4.1 Tướng Phạm Tu — Lão tướng tài ba vùng Thanh Trì
  phamTu: {
    name: 'Phạm Tu',
    title: 'Lão tướng tài ba vùng Thanh Trì',
    lines: [
      'Nghe tin ngài từ quan về quê chiêu binh, lão phu tìm đến xem chí khí ngài thế nào.',
      'Nhà Lương binh hùng tướng mạnh, giáp sắt ngựa béo. Ta dẫu có dũng khí nhưng binh khí thô sơ, làm sao có thể đương cự lâu dài?'
    ],
    question: 'Lý Bí đáp lời Phạm Tu thế nào?',
    answers: [
      'Lấy đoản binh đánh trường trận. Đánh bất ngờ vào trị sở Long Biên khiến địch không kịp trở tay, sau đó lập tức xây dựng thành lũy phòng thủ ở cửa sông sừng sững.',
      'Dàn quân ra đồng bằng, đánh trận lớn với giặc ngay từ đầu.',
      'Đợi rèn đủ giáp sắt, ngựa béo như quân Lương rồi mới dấy binh.'
    ],
    hint: 'Quân ít, khí giới thô sơ thì phải đánh lúc giặc không ngờ tới.',
    why: 'Phạm Tu là người chỉ huy xây dựng thành lũy ở cửa sông Tô Lịch để chặn giặc.',
    reward: {
      id: 'SK_LND_TO_LICH_SHIELD',
      text: 'Khiên Tô Lịch. Trong trận đánh, bấm K để dựng lớp giáp chặn 3 đòn tấn công.'
    }
  },
  // 4.2 Tinh Thiều — Mưu sĩ, học giả xuất chúng bị nhà Lương khinh miệt
  tinhThieu: {
    name: 'Tinh Thiều',
    title: 'Mưu sĩ, học giả xuất chúng bị nhà Lương khinh miệt',
    lines: [
      'Ta từng sang xin làm quan, bị nhà Lương chê xuất thân, chỉ cho làm chức gác cổng.',
      'Bọn giặc Lương chuộng chế độ sĩ tộc, khinh rẻ người phương Nam ta không cho làm quan to. Nay ngài dấy binh, ngài sẽ dùng người bằng cách nào?'
    ],
    question: 'Lý Bí sẽ dùng người thế nào?',
    answers: [
      'Ta dựng nước độc lập, mở lối phong tước bằng thực tài và phẩm hạnh, không phân biệt xuất thân hay dòng dõi. Trí thức Giao Châu sẽ là rường cột của Vạn Xuân.',
      'Chỉ dùng người thuộc dòng dõi hào trưởng, như nhà Lương vẫn làm.',
      'Chỉ cần người giỏi võ, việc văn chương không cần đến.'
    ],
    hint: 'Điều Tinh Thiều căm ghét nhất ở nhà Lương là gì?',
    why: 'Sự trọng dụng nhân tài bất chấp xuất thân đã giúp Lý Bí thu phục được Tinh Thiều làm tướng văn đứng đầu.',
    reward: {
      id: 'BUFF_LND_SUPPLY',
      text: 'Lương thảo dồi dào. Trong trận đánh, quân giặc bị hạ hay rơi bình hồi máu hơn.'
    }
  },
  // 4.3 Triệu Túc — Hào trưởng vùng Chu Diên (Thái phó tương lai)
  trieuTuc: {
    name: 'Triệu Túc',
    title: 'Hào trưởng vùng Chu Diên (Thái phó tương lai)',
    lines: [
      'Cha con ta ở Chu Diên đã nghe danh ngài, muốn đem tráng đinh theo về.',
      'Vùng Chu Diên ta nhiều đầm lầy, tráng đinh giỏi nghề sông nước nhưng chưa quen giáp lá cà. Quân Lương lại thạo đánh bộ. Đâu là chiến sách vẹn toàn?'
    ],
    question: 'Chiến sách nào vẹn toàn?',
    answers: [
      'Lấy thủy binh Chu Diên làm quân tiên phong chặn giặc trên sông, kết hợp bộ binh đánh vu hồi hai bên mạn sườn. Đất hiểm Chu Diên sẽ là phên dậu vững chắc.',
      'Bắt tráng đinh Chu Diên bỏ thuyền lên bờ, đánh giáp lá cà với quân Lương.',
      'Rút hết về rừng sâu, bỏ lại vùng sông nước cho giặc.'
    ],
    hint: 'Hãy dùng đúng sở trường của người Chu Diên.',
    why: 'Sự gia nhập của cha con Triệu Túc (và Triệu Quang Phục sau này) với tài thao lược thủy chiến là chìa khóa thắng lợi của Lý Nam Đế.',
    reward: {
      id: 'SK_LND_TIDE',
      text: 'Triều Cường. Trong trận đánh, bấm L để gọi sóng nước quét sạch quân nhỏ trên màn hình.'
    }
  }
};

// §5.4 Panel kết chương: dòng 1 (điểm) + dòng 2 (kết cục lịch sử), nối bằng dấu
// cách vì #endText hiển thị bằng textContent một đoạn.
export const CHAPTER_END = {
  title: 'Hoàn thành chương Lý Nam Đế',
  text: score => `Bạn đã cùng Lý Bí đánh đuổi quân Lương và đạt ${score} điểm. `
    + 'Mùa xuân năm 544, Lý Bí lên ngôi Hoàng đế, tức Lý Nam Đế, đặt quốc hiệu Vạn Xuân, niên hiệu Thiên Đức, '
    + 'mong đất nước mãi trường tồn như vạn mùa xuân.'
};

// Màn 1: Lý Bí chờ người chơi ở đầu màn (NPC dẫn — engine LEVEL.guide).
// Nguyên văn docs/SUTA_LND_TASK_00.md §5.2 (người dùng duyệt 31/10/2026).
export const STORY_LY_BI_INTRO = {
  portrait: 'PORTRAIT_LY_BI',
  memorial: false,
  name: 'Lý Bí',
  lines: [
    'Ta từng làm Giám quân ở Đức Châu, nhưng không chịu nổi sự tàn bạo, tham nhũng của Tiêu Tư nên đã từ quan về quê.',
    'Nay ta chiêu binh mãi mã. Hãy theo ta vượt qua đồi núi, xuống đồng bằng Giao Châu tập hợp lực lượng.'
  ]
};
