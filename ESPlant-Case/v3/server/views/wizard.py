import os
import glob
import uuid
import shutil
import zipfile
from flask import Blueprint, request, session, render_template, url_for, redirect
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
def upload_board():
    file = request.files["file"]

    if not file:
        return 'No file selected!'

    file_uuid = str(uuid.uuid4())
    filename = secure_filename(file.filename)
    directory_path = utils.get_upload_directory(file_uuid)
    os.makedirs(directory_path)
    file_path = os.path.join(directory_path, filename)
    file.save(file_path)

    if zipfile.is_zipfile(file_path):
        with zipfile.ZipFile(file_path, "r") as zip_ref:
            zip_ref.extractall(directory_path) # TODO ensure secure unpack

        os.remove(file_path)

        # if the zip contains (just) a single folder, move all its contents up
        extracted_dirs = glob.glob(os.path.join(directory_path, '*'))
        if len(extracted_dirs) == 1 and os.path.isdir(extracted_dirs[0]):
            for file_path in glob.glob(os.path.join(extracted_dirs[0], '*')):
                shutil.move(file_path, directory_path)
            os.rmdir(extracted_dirs[0])

        # use first .kicad_pcb file
        filename = next(glob.iglob(os.path.join(directory_path, '*.kicad_pcb')), '')

        if not filename.endswith('.kicad_pcb'):
            return 'No Kicad PCB file was found in the archive!'

    tasks.run_convert.delay(directory_path, filename)
    session["file"] = file_uuid
    return redirect(url_for("wizard.view_board"))


@bp.route("/board")
def view_board():
    return render_template("./pages/wizard/view_board.html", glb_path=url_for("files.serve_board", id=session["file"]))


@bp.route("/bottom-case", methods=["POST"])
def generate_bottom_case():
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
    return redirect(url_for("wizard.view_bottom_case"))


@bp.route("/bottom-case")
def view_bottom_case():
    return render_template("./pages/wizard/view_bottom_case.html", glb_path=url_for("files.serve_bottom_case", id=session["file"]))


@bp.route("/finish", methods=["POST"])
def confirm():
    return ":)"