"""Development entry point for the Sử Ta web application."""

from backend import create_app
from backend.config import Config
from backend.db import init_db


app = create_app()


if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
