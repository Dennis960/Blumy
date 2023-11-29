import os
from flask import Blueprint, session, send_file

from .. import utils

bp = Blueprint("files", __name__, url_prefix="/files")

@bp.route("/board/<id>")
def serve_board(id: str):
    if session["file"] != id:
        return "Does not exist or no access"
    
    dir = utils.get_upload_directory(id)
    return send_file(os.path.join(dir, "board.glb"))


@bp.route("/bottom-case/<id>")
def serve_bottom_case(id: str):
    if session["file"] != id:
        return "Does not exist or no access"
    
    dir = utils.get_upload_directory(id)
    return send_file(os.path.join(dir, "bottom-case.glb"))