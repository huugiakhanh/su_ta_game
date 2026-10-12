---
name: task-report
description: >-
  Kết thúc một đầu việc của Sử Ta — chạy test, viết report docs/REPORT_<MÃ>.md theo mẫu (file đã sửa, quyết định người dùng chốt, kết quả test PASS/FAIL có số đo, vấn đề asset, TODO), cập nhật CLAUDE.md/rules nếu quy ước đổi, và chuyển task card/plan/report của việc đã xong vào docs/archive/. Dùng khi làm xong một task, khi người dùng nói "viết report", "tổng kết", "xong việc", hoặc trước khi commit một đầu việc lớn.
argument-hint: "[MÃ-TASK, vd. HOME-LAZY-01]"
---

# /task-report — tổng kết đầu việc

Mã task: `$ARGUMENTS`. Chưa có mã thì đặt theo mẫu `<VÙNG>-<CHỦ ĐỀ>-<NN>` (vd. `TT-BOSS-01`, `SUTA-DB-01`, `HOME-LAZY-01`) và báo người dùng mã đã đặt.

## 1. Thu thập bằng chứng (không đoán)

1. `git status --short` + `git diff --stat` — danh sách file thật sự đổi. File đổi mà **không phải do phiên này** (người khác/người dùng sửa) → ghi riêng, không nhận là của mình.
2. Task card trong `docs/` (nếu có): đọc acceptance criteria + test case, đối chiếu từng mục.
3. Chạy `python -m pytest tests -q` → ghi đúng dòng kết quả (vd. `71 passed, 1 skipped`). `test_app.py` skip vì thiếu `SUTA_TEST_DATABASE_URL` là bình thường — ghi rõ test DB **chưa chạy**.
4. Thay đổi nhìn thấy trên trình duyệt mà chưa kiểm → chạy skill `/verify-ui` trước, lấy số đo.

## 2. Viết report

Ghi vào `docs/REPORT_<MÃ>.md` theo [template.md](template.md). Quy tắc:

- Viết tiếng Việt, câu ngắn, có số đo cụ thể (KB, số request, px lệch, số test) thay vì "đã ổn".
- **Quyết định người dùng chốt** ghi nguyên ý (để lần sau không hỏi lại / không làm ngược).
- Kết quả test: mỗi mục `PASS`/`FAIL`/`CHƯA CHẠY` + cách kiểm. Có `FAIL` hoặc sửa ngoài phạm vi → tiêu đề report thêm `— BLOCKED`, báo người dùng, **không** báo hoàn thành.
- Vấn đề asset: Claude không sửa ảnh → ghi `NORMALIZE` (sửa nhẹ: cỡ, pivot, alpha) hoặc `NEED_REDRAW` (vẽ lại) kèm asset ID + mô tả để giao Codex.
- Nội dung lịch sử nghi sai/thiếu → ghi vào "Câu hỏi cho team", không tự sửa.
- Thay đổi hành vi nhỏ ngoài yêu cầu (dù hợp lý) phải ghi ra.

## 3. Cập nhật tài liệu sống

- Quy ước/cấu trúc mới mà phiên sau cần biết → sửa `CLAUDE.md` (nếu áp dụng mọi nơi) hoặc rule đúng vùng trong `.claude/rules/`. Viết **quy tắc + lý do ngắn**, không ghi nhật ký (ngày, ai duyệt) — nhật ký nằm trong report.
- Đổi tên/chuyển file → tìm và sửa mọi chỗ trỏ tới (`grep -rn "<tên cũ>"`), kiểm không còn link markdown hỏng.

## 4. Lưu trữ việc đã xong

Chỉ khi đầu việc **xong hẳn** (không còn chờ duyệt) và người dùng đồng ý:

- `git mv` task card, plan, report của việc đó vào `docs/archive/`; sửa link `docs/<file>` → `docs/archive/<file>` ở mọi nơi.
- Prompt Codex `docs/CODEX_PROMPT_*.md` chỉ xoá khi Codex đã nộp **và** team đã duyệt (asset `status` không còn `NORMALIZED`/chờ Gate).

## 5. Báo người dùng

Tóm tắt trong chat: việc đã làm, kết quả test (số), điều người dùng cần biết/quyết, đường dẫn report. **Không commit** trừ khi người dùng yêu cầu (dùng `/commit-master`).
