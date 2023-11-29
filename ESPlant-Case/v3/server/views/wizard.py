import os
import uuid
import time
from flask import Blueprint, request, session, render_template, url_for
from werkzeug.utils import secure_filename
from cq_part import PartSetting, HOLE_TYPE, DIMENSION_TYPE, ALIGNMENT

from .. import parameters
from .. import utils
from .. import tasks

bp = Blueprint("wizard", __name__, url_prefix="/wizard")

@bp.route("/upload")
def upload():
    return render_template("./pages/wizard/upload.html")

@bp.route("/board", methods=["POST"])
def view_board():
    file = request.files["file"]

    if not file:
        return 'No file selected!'

    file_uuid = str(uuid.uuid4())
    filename = secure_filename(file.filename)
    directory_path = utils.get_upload_directory(file_uuid)
    os.makedirs(directory_path)
    file_path = os.path.join(directory_path, filename)
    file.save(file_path)
    tasks.run_convert.delay(directory_path, filename)
    session["file"] = file_uuid
    return render_template("./pages/wizard/view_board.html", glb_path=url_for("files.serve_board", id=file_uuid))

@bp.route("/bottom-case", methods=["POST"])
def view_bottom_case():
    id = session["file"]

    if id is None:
        return "Does not exist"

    root_path = utils.get_upload_directory(id)

    pcb_tolerance=(1.5, 1.5, 0.5)
    config = parameters.CaseConfiguration(
        case_wall_thickness=1.5,
        case_floor_height=8 + 1.6,
        hole_fit_tolerance=0.1,
        pcb_tolerance=pcb_tolerance,
        part_tolerance=1,
        should_use_fixation_holes=True,
        fixation_hole_diameter=2.0,
        parts_to_ignore_in_case_generation=["PinHeader"],
        part_settings=[
            PartSetting(".*", ">Z", pcb_tolerance[2]),
            PartSetting(".*", "<Z", pcb_tolerance[2]),
            PartSetting(".*MICRO-USB.*", ">X", HOLE_TYPE.HOLE, width=11, height=6.5),
            PartSetting(".*SW-SMD_4P.*", ">Z", HOLE_TYPE.HOLE),
            PartSetting(".*SW-SMD_MK.*", ">Z", HOLE_TYPE.HOLE, offset_y=-2, height=10),
            PartSetting(".*LED.*", ">Z", HOLE_TYPE.HOLE),
            PartSetting(".*ALS-PT19.*", ">Z", HOLE_TYPE.HOLE),
            PartSetting(".*PCB.*", "<Z", HOLE_TYPE.HOLE),
            PartSetting(".*ESP.*", "<Z", HOLE_TYPE.HOLE),
            PartSetting(".*ESP.*", ">Z", 2),
        ],
        bottom_case_dimension=(DIMENSION_TYPE.AUTO, 62, DIMENSION_TYPE.AUTO),
        bottom_case_offset=(0, ALIGNMENT.POSITIVE, 0),
        list_of_additional_parts=[]
    )

    tasks.run_generate_bottom_case.delay(root_path, config)
    return render_template("./pages/wizard/view_bottom_case.html", glb_path=url_for("files.serve_bottom_case", id=id))


@bp.route("/finish", methods=["POST"])
def confirm():
    return ":)"