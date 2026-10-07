from flask import Blueprint, render_template


pages_bp = Blueprint("pages", __name__)

@pages_bp.get("/")
def home():
    return render_template("home.html")



# LIBRARY
@pages_bp.get("/history")
def history_library_timeline():
    return render_template("history.html")

@pages_bp.get("/history_library/trung-trac")
def history_trung_trac_detail():
    # Đảm bảo trỏ đúng vào thư mục theo ảnh của bạn
    return render_template("gameplay/library/trung-trac.html")


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