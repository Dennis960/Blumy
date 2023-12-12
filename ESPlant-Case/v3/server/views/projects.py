import os
import glob
import uuid
import shutil
import zipfile
from flask import Blueprint, request, render_template, url_for, redirect, send_file
from werkzeug.utils import secure_filename
import settings
from .. import utils
from .. import tasks


def get_version():
    return int(request.args.get("version", 1))

def incremented_version():
    return int(request.args.get("version", 0)) + 1


bp = Blueprint("projects", __name__, url_prefix="/projects")

@bp.route("/new")
def upload():
    return render_template("./pages/projects/upload.html")


@bp.route("/new", methods=["POST"])
def upload_board():
    file = request.files["file"]

    if not file:
        return 'No file selected!'

    project_id = str(uuid.uuid4())

    filename = secure_filename(file.filename)
    directory_path = utils.get_project_directory(project_id)
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

    config = settings.CaseSettings()

    version = incremented_version()
    utils.write_config(project_id, version, config)
    return redirect(url_for("projects.view_board", project_id=project_id, version=version))


@bp.route("/<project_id>/board")
def view_board(project_id: str):
    version = get_version()
    return render_template("./pages/projects/board.html",
        project_id=project_id,
        version=version,
        glb_path=url_for("projects.board_glb", project_id=project_id, version=version),
    )


@bp.route("/<project_id>/parameters", methods=["POST"])
def set_parameters(project_id: str):
    previous_config = utils.read_config(project_id, get_version())

    case_wall_thickness = float(request.form['case_wall_thickness'])
    case_floor_height = float(request.form['case_floor_height'])
    hole_fit_tolerance = float(request.form['hole_fit_tolerance'])
    pcb_tolerance_x = float(request.form['pcb_tolerance_x'])
    pcb_tolerance_y = float(request.form['pcb_tolerance_y'])
    pcb_tolerance_z = float(request.form['pcb_tolerance_z'])
    pcb_tolerance = (pcb_tolerance_x, pcb_tolerance_y, pcb_tolerance_z)
    part_tolerance = float(request.form['part_tolerance'])
    should_use_fixation_holes = 'should_use_fixation_holes' in request.form
    fixation_hole_diameter = float(request.form['fixation_hole_diameter'])

    config = settings.CaseSettings(
        case_wall_thickness,
        case_floor_height,
        hole_fit_tolerance,
        pcb_tolerance,
        part_tolerance,
        should_use_fixation_holes,
        fixation_hole_diameter,
        # not supported yet:
        previous_config.parts_to_ignore_in_case_generation,
        previous_config.part_settings,
        previous_config.bottom_case_dimension,
        previous_config.bottom_case_offset,
        previous_config.list_of_additional_parts
    )

    version = incremented_version()
    utils.write_config(project_id, version, config)
    return redirect(url_for("projects.view_parameters",
        project_id=project_id,
        version=version
    ))


@bp.route("/<project_id>/parameters")
def view_parameters(project_id: str):
    version = get_version()
    return render_template("./pages/projects/parameters.html",
        project_id=project_id,
        version=version,
        config=utils.read_config(project_id, version)
    )


@bp.route("/<project_id>/bottom-case", methods=["POST"])
def generate_bottom_case(project_id: str):
    version = get_version()
    tasks.run_generate_bottom_case.delay(project_id, version)
    return redirect(url_for("projects.view_bottom_case", project_id=project_id, version=version))


@bp.route("/<project_id>/bottom-case")
def view_bottom_case(project_id: str):
    version = get_version()
    return render_template("./pages/projects/bottom_case.html",
        project_id=project_id,
        version=version,
        glb_path=url_for("projects.bottom_case", format="glb", project_id=project_id, version=version)
    )


@bp.route("/<project_id>/download", methods=["POST"])
def confirm(project_id: str):
    return redirect(url_for("projects.view_download", project_id=project_id, version=get_version()))


@bp.route("/<project_id>/download")
def view_download(project_id: str):
    return render_template("./pages/projects/download.html",
        project_id=project_id,
        version=get_version()
    )


@bp.route("/<project_id>/board.glb")
def board_glb(project_id: str):
    file_path = utils.get_project_export_glb_path(project_id)

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)


@bp.route("/<project_id>/bottom-case.<format>")
def bottom_case(project_id: str, format: str):
    if format not in ['glb', 'stl', 'step']:
        return "Invalid file format", 400

    file_path = utils.get_project_version_export_base_path(project_id, get_version()) + "." + format

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)
