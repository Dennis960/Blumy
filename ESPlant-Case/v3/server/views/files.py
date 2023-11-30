import os
from flask import Blueprint, session, send_file

from .. import utils

bp = Blueprint("files", __name__, url_prefix="/files")

@bp.route("/board/<id>")
def serve_board(id: str):
    if session["file"] != id:
        return "Does not exist or no access", 404
    
    dir = utils.get_upload_directory(id)
    file_path = os.path.join(dir, "board.glb")

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)


@bp.route("/bottom-case/<id>")
def serve_bottom_case(id: str):
    if session["file"] != id:
        return "Does not exist or no access", 404
    
    dir = utils.get_upload_directory(id)
    file_path = os.path.join(dir, "bottom-case.glb")

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)