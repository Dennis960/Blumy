import os
from flask import current_app

def get_upload_directory(id: str) -> str:
    return os.path.join(current_app.config['UPLOAD_ROOT'], id)