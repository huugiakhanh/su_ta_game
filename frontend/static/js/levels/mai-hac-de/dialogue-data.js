// Thoại chương Mai Hắc Đế — chép NGUYÊN VĂN từ docs/SUTA_MHD_TASK_00.md (Source
// of Truth, không tự sửa). Đã duyệt: §5.1 câu mô tả màn 1 + §5.2 thoại Mai Thúc
// Loan dẫn màn 1 (MHD-L1 Q1) và §4 thoại 3 NPC màn 2 (người dùng duyệt 08/11/2026,
// MHD-L2). Cutscene, câu kết chương (§5.3–5.4) duyệt nguyên văn 08/11/2026 (MHD-L3).

// Màn 1 — Mai Thúc Loan dẫn màn (§5.2).
export const STORY_MHD_INTRO = {
  portrait: 'PORTRAIT_MAI_THUC_LOAN',
  memorial: false,
  name: 'Mai Thúc Loan',
  lines: [
    'Ta là Mai Thúc Loan, người dân phu Hoan Châu. Bà con đang gánh cống phẩm dưới đòn roi lính canh.',
    'Tới xe cống phía trước, hãy đập vỡ sọt cống phẩm và giải phóng dân phu!'
  ]
};

// Màn 2 — 3 NPC (§4.1–4.3, duyệt 08/11/2026): đáp án đúng đứng đầu (engine tự xáo
// khi hiện). name/title tách từ tiêu đề mục §4.x (phần trong ngoặc = title). Khoá
// NPC trùng khoá pool câu hỏi (NPC_QUESTION_POOLS).
export const NPC_DIALOGUES = {
  // 4.1 Mẹ Mai Thúc Loan (Mai Thị — Tương truyền)
  maThi: {
    name: 'Mẹ Mai Thúc Loan',
    title: 'Mai Thị — Tương truyền',
    lines: [
      'Con về rồi đấy ư? Cả xóm đồn con đã đập vỡ sọt cống phẩm.',
      'Con gánh cống phẩm đi nộp, thân làm phu phen khốn khổ. Cớ sao lại cản đường lính canh, chuốc lấy hiểm nguy cho bản thân?'
    ],
    question: 'Mai Thúc Loan trả lời mẹ thế nào?',
    answers: [
      'Con thà đập vỡ sọt cống phẩm, chịu tội chém đầu còn hơn để bá tánh kiệt sức chết dọc đường. Ý chí của dân nghèo bị dồn vào chân tường là vũ khí mạnh nhất.',
      'Con chỉ lỡ tay, xin mẹ để con đi xin tội với lính canh.',
      'Con sẽ bỏ xứ đi nơi khác, mặc cho dân phu gánh tiếp.'
    ],
    hint: 'Dân phu đang kiệt sức dọc đường. Ai sẽ đứng ra vì họ?',
    why: 'Sự phẫn nộ và quyết đoán đập vỡ cống phẩm là ngòi nổ tập hợp lòng dân của Mai Hắc Đế.',
    reward: {
      id: 'BUFF_MHD_POWER',
      text: 'Ý chí dân nghèo. Trong trận đánh, sức mạnh đòn đánh cơ bản tăng 20%.'
    }
  },
  // 4.2 Thúc Bảo (Người bạn chiến đấu đắc lực)
  thucBao: {
    name: 'Thúc Bảo',
    title: 'Người bạn chiến đấu đắc lực',
    lines: [
      'Anh em đã tụ về đông lắm, nhưng chưa có chỗ đứng chân.',
      'Nhà Đường tất sẽ điều đại quân từ phương Bắc xuống đàn áp. Vùng Hoan Châu ta đất rộng người thưa, ta nên lập căn cứ ở đâu để thủ hiểm dài lâu?'
    ],
    question: 'Mai Thúc Loan chọn lập căn cứ ở đâu?',
    answers: [
      'Chọn vùng Sa Nam, dựa vào dãy Hùng Sơn hiểm trở và dòng sông Lam làm hào nước tự nhiên để xây dựng thành Vạn An phòng ngự kiên cố.',
      'Đóng quân giữa đồng bằng trống trải cho dễ tiến thoái.',
      'Chia quân về từng làng, không cần căn cứ chung.'
    ],
    hint: 'Cần nơi có núi dựa lưng và sông che trước mặt.',
    why: 'Địa thế Sa Nam (Nam Đàn) "công thủ toàn diện" là lựa chọn chiến lược vĩ đại của Mai Thúc Loan.',
    reward: {
      id: 'SK_MHD_VAN_AN_SHELL',
      text: 'Vỏ Bọc Vạn An. Trong trận đánh, bấm K để miễn nhiễm sát thương 1 lần.'
    }
  },
  // 4.3 Sứ giả nước Lâm Ấp
  suGia: {
    name: 'Sứ giả nước Lâm Ấp',
    title: '',
    lines: [
      'Tiếng tăm nghĩa quân Hoan Châu đã vang tới phương Nam.',
      'Nước ngài quân lực dẫu đang lên nhưng so với triều đình nhà Đường vẫn chỉ là lấy trứng chọi đá. Làm sao để phá vỡ thế bị bao vây cô lập?'
    ],
    question: 'Mai Thúc Loan sẽ làm gì?',
    answers: [
      'Phái sứ giả giao hảo, kết minh với Lâm Ấp, Chân Lạp ở phía Nam và các thủ lĩnh miền núi để tạo thế gọng kìm, khiến giặc phải phân tán lực lượng.',
      'Một mình chống giặc, không cần cầu viện ai.',
      'Đem vàng bạc sang nộp cho nhà Đường để xin hoà.'
    ],
    hint: 'Một mình khó chống nổi nhà Đường. Hãy tìm đồng minh.',
    why: 'Mai Hắc Đế có tầm nhìn ngoại giao xuất sắc, kết minh với Lâm Ấp, Chân Lạp ở phía Nam.',
    reward: {
      id: 'SK_MHD_REINFORCE',
      text: 'Viện Binh. Trong trận đánh, bấm L gọi viện binh dọn lính.'
    }
  }
};

// Cutscene màn 3 (§5.3) và panel kết chương (§5.4, duyệt nguyên văn 08/11/2026).
export const STORY_MHD_FLEE = {
  portrait: 'PORTRAIT_QUANG_SO_KHACH',
  memorial: false,
  lines: ['Quang Sở Khách bỏ vũ khí, lên ngựa mở cổng thành tẩu thoát về nước.']
};

export const STORY_MHD_FLAG = {
  portrait: 'PORTRAIT_MAI_THUC_LOAN',
  memorial: false,
  lines: ['Cờ Hắc Đế tung bay trên thành Tống Bình.']
};

export const CHAPTER_END = {
  title: 'Hoàn thành chương Mai Hắc Đế',
  text: score => `Bạn đã cùng Mai Thúc Loan giải phóng thành Tống Bình và đạt ${score} điểm. `
    + 'Từ căn cứ Sa Nam với thành Vạn An, Mai Hắc Đế tiến đánh và giải phóng thành Tống Bình, thủ phủ chính quyền đô hộ.'
};
