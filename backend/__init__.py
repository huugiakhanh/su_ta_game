from flask import Flask, request
from flask_cors import CORS

from backend.config import Config
from backend.routes.api import api_bp
from backend.routes.pages import pages_bp

STATIC_ASSET_PREFIX = "/static/assets/"
STATIC_ASSET_MAX_AGE = 24 * 60 * 60  # giây — DESIGN_BASELINE


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

    @app.after_request
    def cache_static_assets(response):
        # Ảnh/âm thanh/manifest trong static/assets ít đổi: cho trình duyệt giữ 1
        # ngày, vào màn lần sau không phải hỏi lại server từng file. JS/CSS vẫn
        # theo mặc định (hỏi lại mỗi lần) để sửa code có tác dụng ngay.
        if request.path.startswith(STATIC_ASSET_PREFIX) and response.status_code in (200, 304):
            response.cache_control.no_cache = None
            response.cache_control.public = True
            response.cache_control.max_age = STATIC_ASSET_MAX_AGE
        return response

    return app
