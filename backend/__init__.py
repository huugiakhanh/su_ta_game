from flask import Flask
from flask_cors import CORS

from backend.config import Config
from backend.routes.api import api_bp
from backend.routes.pages import pages_bp


def create_app(config_class=Config):
    """Create and configure the Sử Ta web application."""
    app = Flask(
        __name__,
        template_folder="../frontend/templates",
        static_folder="../frontend/static",
        static_url_path="/static",
    )
    app.config.from_object(config_class)
    CORS(app)

    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp)

    return app
