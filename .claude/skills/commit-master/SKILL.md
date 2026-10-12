---
name: commit-master
description: >-
  Commit thay đổi của phiên hiện tại lên nhánh master của Sử Ta một cách an toàn — chỉ stage file do phiên này sửa, hỏi lại về file lạ, kiểm test, viết commit message chuẩn, kiểm tra commit sau khi tạo, không push. Dùng khi người dùng nói "commit đi", "commit tại master".
disable-model-invocation: true
argument-hint: "[ghi chú thêm cho commit message]"
---

# /commit-master

Người dùng làm việc trực tiếp trên `master` và đã cho phép commit tại đây. **Không push** — chỉ đưa lệnh push để người dùng tự chạy.

## 1. Soát thay đổi

1. `git status --short` và `git diff --stat`.
2. Phân loại từng file:
   - **Của phiên này** (Claude đã tạo/sửa/xoá/đổi tên trong hội thoại) → stage.
   - **Không phải của phiên này** (người dùng/người khác sửa, vd. 1 dòng lạ trong template) → **không stage**; xem `git diff <file>`, mô tả ngắn cho người dùng và hỏi có gộp không.
   - File phiên này tạo mà **không còn trên đĩa** (bị xoá ngoài ý) → không tự tạo lại; báo người dùng.
3. Không commit file bí mật (`.env`, khoá, dump DB) hay file rác (`__pycache__`, `*.log`, ảnh tạm).

## 2. Kiểm tra trước khi commit

- `python -m pytest tests -q` phải không có FAIL. Có FAIL → dừng, báo người dùng.
- Có report của đầu việc chưa? Việc lớn mà chưa có → nhắc (skill `/task-report`), không tự chặn.

## 3. Stage đúng file

- Stage **từng đường dẫn cụ thể** (`git add <file> …`); **không** dùng `git add -A` / `git add .`.
- File đã `git mv`/`git rm` trong phiên thì đã ở index — kiểm lại bằng `git status`.
- Cảnh báo `LF will be replaced by CRLF` là bình thường trên Windows, bỏ qua (lọc khỏi output).

## 4. Commit message

- Dòng đầu tiếng Anh, dạng `<type>: <tóm tắt>` — `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`. ≤ 72 ký tự.
- Thân: gạch đầu dòng ngắn, nêu **cái gì + vì sao**, số đo quan trọng (vd. `25 requests / ~27 MB -> 9 / ~4.5 MB`).
- Ghi chú thêm từ người dùng: `$ARGUMENTS`.
- Kết thúc bằng dòng attribution `Co-Authored-By:` mà hệ thống cung cấp trong phiên (không tự bịa tên model).
- Truyền message qua heredoc (`git commit -q -F - <<'EOF' … EOF`) để giữ dấu và xuống dòng.
- Không dùng `--no-verify`, không `--amend` commit đã có.

## 5. Sau khi commit

1. `git log --oneline -1` + `git show --stat --format= HEAD` — đối chiếu danh sách file với bước 1 (thiếu file nào thì báo).
2. `git status --short` — liệt kê những gì còn lại chưa commit và lý do.
3. Báo người dùng: mã commit, tiêu đề, số file; file cố ý để lại; lệnh push trong khối `bash` riêng:

```bash
git push origin master
```
