import os

from dotenv import load_dotenv


load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SUTA_SECRET_KEY", "dev-only-change-me")
    DATABASE_URL = os.getenv("SUTA_DATABASE_URL", "")
    HOST = os.getenv("SUTA_HOST", "127.0.0.1")
    PORT = int(os.getenv("SUTA_PORT", "5000"))
    DEBUG = os.getenv("SUTA_DEBUG", "1") == "1"
