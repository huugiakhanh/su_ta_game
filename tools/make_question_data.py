"""Sinh `questions-data.js` của một chương từ ngân hàng câu hỏi JSON (BT-SKELETON).

Nguồn: frontend/static/assets/question/<chương>-question.json — bản JSON của sheet
Excel team (đã đối chiếu khớp Excel, xem docs/SUTA_BT_TASK_00.md). Nội dung câu hỏi
là Source of Truth: script chỉ chép, không sửa chữ.

Chạy:  python tools/make_question_data.py ba-trieu
Chỉ dùng cho chương có cấu hình trong CHAPTERS bên dưới (Trưng Trắc giữ file cũ).
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUESTION_DIR = ROOT / "frontend" / "static" / "assets" / "question"
LEVELS_DIR = ROOT / "frontend" / "static" / "js" / "levels"

# excluded: câu team loại hẳn; level1: bộ rút câu hỏi màn 1; npc: bộ câu hỏi
# chặn đường trước từng NPC màn 2 (khoá = id NPC trong dialogue-data.js).
CHAPTERS = {
    "ba-trieu": {
        "task": "docs/SUTA_BT_TASK_00.md §3.3",
        "excluded": [15, 33, 37, 41, 45],
        "level1": [1, 2, 3, 4, 8, 9, 10, 11, 12, 14, 18, 19, 20, 21, 22, 24, 25, 26, 28, 30, 31, 32,
                   34, 35, 38, 39, 40, 42, 43, 46, 47, 48],
        "npc": {
            "quocDat": [5, 6, 13, 27, 29, 50],
            "hoLy": [16, 17, 44, 49],
            "bachTuong": [7, 23, 36],
        },
    },
}


def js(value):
    return json.dumps(value, ensure_ascii=False)


def build(slug):
    config = CHAPTERS[slug]
    bank = json.loads((QUESTION_DIR / f"{slug}-question.json").read_text(encoding="utf-8"))
    questions = {item["id"]: item for item in bank if item["id"] not in config["excluded"]}
    used = config["level1"] + [stt for pool in config["npc"].values() for stt in pool]
    missing = [stt for stt in used if stt not in questions]
    if missing:
        raise SystemExit(f"Pool có câu không tồn tại hoặc đã bị loại: {missing}")
    if len(used) != len(set(used)):
        raise SystemExit("Một câu nằm trong nhiều pool.")

    lines = [
        f"// SINH TỰ ĐỘNG bằng tools/make_question_data.py {slug} — KHÔNG sửa tay.",
        f"// Nguồn: assets/question/{slug}-question.json (Excel của team). Pool + câu loại: {config['task']}.",
        f"// Câu team loại hẳn: {', '.join(map(str, config['excluded']))}.",
        "",
        "export const QUESTIONS = {",
    ]
    for stt in sorted(questions):
        item = questions[stt]
        lines.append(
            f"  {stt}: {{stt: {stt}, question: {js(item['question'])}, answers: {js(item['options'])}, "
            f"correct: {item['correct']}, explain: {js(item['explanation'])}}},"
        )
    lines += [
        "};",
        "",
        "// Màn 1: mỗi lượt rút ngẫu nhiên QUIZ.level1Count câu trong bộ này (config.js).",
        f"export const LEVEL1_QUESTION_POOL = {js(config['level1'])};",
        "",
        "// Màn 2: câu hỏi chặn đường trước mỗi NPC — rút 1 câu trong bộ của NPC đó.",
        "export const NPC_QUESTION_POOLS = {",
    ]
    npc_lines = [f"  {npc}: {js(pool)}" for npc, pool in config["npc"].items()]
    lines.append(",\n".join(npc_lines))
    lines += ["};", ""]
    target = LEVELS_DIR / slug / "questions-data.js"
    target.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(f"{target.relative_to(ROOT)}: {len(questions)} câu")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in CHAPTERS:
        raise SystemExit(f"Dùng: python tools/make_question_data.py <{'|'.join(CHAPTERS)}>")
    build(sys.argv[1])
