import json
from pathlib import Path

from flask import Blueprint, render_template


# Nội dung trang nhân vật Thư viện lịch sử (slug trong URL -> dữ liệu), dùng chung
# template library/hero.html. Đọc lại mỗi request để sửa JSON là thấy ngay.
LIBRARY_HEROES_FILE = Path(__file__).resolve().parent.parent / "data" / "library_heroes.json"


def load_library_heroes():
    with LIBRARY_HEROES_FILE.open(encoding="utf-8") as file:
        return json.load(file)


pages_bp = Blueprint("pages", __name__)

@pages_bp.get("/")
def home():
    return render_template("home.html")


# Cửa sổ của trang chủ, tải khi người chơi bấm lần đầu (HOME-LAZY-01) — khớp
# COMPONENTS ở frontend/static/js/home/loader.js.
HOME_COMPONENTS = {"timeline", "leaderboard", "achievements", "login", "chapter"}


@pages_bp.get("/components/home/<name>")
def home_component(name):
    if name not in HOME_COMPONENTS:
        return "Không có thành phần này.", 404
    return render_template(f"components/home/{name}.html")



# LIBRARY
@pages_bp.get("/history")
def history_library_timeline():
    return render_template("history.html")

@pages_bp.get("/history_library/<hero_name>")
def history_hero_detail(hero_name):
    hero = load_library_heroes().get(hero_name)
    if hero is None:
        return "Trang nhân vật này chưa được tạo hoặc đang cập nhật!", 404
    return render_template("library/hero.html", hero=hero)


# QUIZ
@pages_bp.get("/quiz")
def quiz_view():
    return render_template("/quiz.html")


# GAME PLAY
@pages_bp.get("/gameplay/level/Trung_Trac/trung-trac.html")
@pages_bp.get("/gameplay/levels/trung-trac")
def trung_trac():
    return render_template(
        "gameplay/levels/trung-trac.html", level_id=1, title="Màn 1: Vượt ải"
    )

@pages_bp.get("/gameplay/level/level%20test/level-test-inline.html")
@pages_bp.get("/gameplay/level/level test/level-test-inline.html")
@pages_bp.get("/gameplay/levels/level-test")
def level_test():
    return render_template("gameplay/levels/level-test.html")

@pages_bp.get("/gameplay/levels/trung-trac/2")
def trung_trac_level_2():
    return render_template(
        "gameplay/levels/trung-trac.html",
        level_id=2,
        title="Màn 2: Chiêu mộ hiền tài",
    )


@pages_bp.get("/gameplay/levels/trung-trac/3")
def trung_trac_level_3():
    return render_template(
        "gameplay/levels/trung-trac.html",
        level_id=3,
        title="Màn 3: Trận Luy Lâu",
    )