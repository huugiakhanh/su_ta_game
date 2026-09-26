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
    return render_template("gameplay/levels/trung-trac.html")


@pages_bp.get("/gameplay/level/level%20test/level-test-inline.html")
@pages_bp.get("/gameplay/level/level test/level-test-inline.html")
@pages_bp.get("/gameplay/levels/level-test")
def level_test():
    return render_template("gameplay/levels/level-test.html")

@pages_bp.get("/quiz")
def quiz_view():
    return render_template("/quiz.html")
