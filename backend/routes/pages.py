from flask import Blueprint, render_template


pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def home():
    return render_template("home.html")


@pages_bp.get("/history")
@pages_bp.get("/history_library/history.html")
def history():
    return render_template("history.html")

@pages_bp.route('/history/trung-trac')
def library_trung_trac():
    return render_template('gameplay/library/trung-trac.html')

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

@pages_bp.get("/quiz")
def quiz_view():
    return render_template("/quiz.html")

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