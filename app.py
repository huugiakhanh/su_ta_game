"""Development entry point for the Sử Ta web application."""

from backend import create_app
from backend.config import Config
from backend.db import run_migrations


app = create_app()


if __name__ == "__main__":
    with app.app_context():
        run_migrations()
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
