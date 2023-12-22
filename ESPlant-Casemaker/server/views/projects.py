import os
import uuid
from flask import Blueprint, request, render_template, url_for, redirect, send_file
from werkzeug.utils import secure_filename
import cadquery as cq
from flask import current_app
from celery_worker import tasks
from casemaker import settings
from casemaker.casemaker import CasemakerLoader
from .. import settings_form
from ..project_repository import ProjectRepository

def upload_root():
    return current_app.config['UPLOAD_ROOT']

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

    project_repository = ProjectRepository(upload_root())
    filename = secure_filename(file.filename)
    project_repository.store_pcb(project_id, filename, file)

    pcb_path = project_repository.pcb_path(project_id)
    if not pcb_path.endswith('.kicad_pcb'):
        print('Not a kicad_pcb for project {}: {}'.format(project_id, pcb_path))
        # TODO delete project
        return 'No Kicad PCB file was found in the archive!'

    tasks.run_convert.delay(upload_root(), project_id)

    version = incremented_version()
    return redirect(url_for(
        "projects.view_board",
        project_id=project_id,
        version=version
    ))


@bp.route("/<project_id>/board")
def view_board(project_id: str):
    version = get_version()
    return render_template("./pages/projects/board.html",
        project_id=project_id,
        version=version,
        glb_path=url_for("projects.board_glb", project_id=project_id, version=version),
    )


@bp.route("/<project_id>/board-settings", methods=['GET', 'POST'])
def board_settings_form(project_id: str):
    # TODO validate that project and board exist
    version = get_version()

    form = settings_form.BoardSettingsForm()

    project_repository = ProjectRepository(upload_root())
    board_settings = project_repository.load_board_settings(project_id, version)

    # populate PCB select fields with part names
    board = CasemakerLoader(project_repository.cache_path(project_id))\
        .load_pickle()
    if board is not None:
        part_names = list(board.shapes_dict.keys())
    else:
        # TODO wait for conversion
        part_names = []

    for field in form:
        if field.type == "SelectPCBPartField" or field.type == "SelectMultiplePCBPartField":
            field.choices = part_names
    
    # search and default-select PCB part
    pcb_part_names = [pn for pn in part_names if pn.endswith("_PCB")]
    form.pcb_part_name.default = pcb_part_names[0] if pcb_part_names else None
    form.process() # apply default

    # map form to settings entity
    if form.validate_on_submit():
        pcb_tolerance = cq.Vector(
            form.pcb_tolerance_x.data,
            form.pcb_tolerance_y.data,
            form.pcb_tolerance_z.data,
        )
        board_settings = settings.BoardSettings(
            pcb_tolerance=pcb_tolerance,
            part_tolerance=form.part_tolerance.data,
            part_settings=board_settings.part_settings if board_settings is not None else [],
            pcb_part_name=form.pcb_part_name.data,
            exclude=form.exclude.data,
            parts_without_tolerances=form.parts_without_tolerances.data,
        )

        project_repository.store_board_settings(project_id, version, board_settings)
        print("Stored board settings in project {} version {}".format(project_id, version))

    # map entity to form (if exists)
    if not form.is_submitted() and board_settings is not None:
        form.pcb_tolerance_x.data = board_settings.pcb_tolerance.x
        form.pcb_tolerance_y.data = board_settings.pcb_tolerance.y
        form.pcb_tolerance_z.data = board_settings.pcb_tolerance.z
        form.part_tolerance.data = board_settings.part_tolerance
        form.pcb_part_name.data = board_settings.pcb_part_name
        form.exclude.data = board_settings.exclude
        form.parts_without_tolerances.data = board_settings.parts_without_tolerances
        print("Loaded board settings in project {} version {}".format(project_id, version))

    return render_template("./partials/board_settings_form.html",
        project_id=project_id,
        form=form,
    )


@bp.route("/<project_id>/part-settings", methods=['GET', 'POST'])
def part_settings_form(project_id: str):
    # TODO validate that project and board exist
    version = get_version()

    # TODO escape part_name as regex
    part_name = request.args.get("part")

    project_repository = ProjectRepository(upload_root())
    board_settings = project_repository.load_board_settings(project_id, version)

    if board_settings is None:
        return "Error: Configure board first"

    board = CasemakerLoader(project_repository.cache_path(project_id))\
        .load_pickle()
    valid_part_names = list(board.shapes_dict.keys())

    if part_name is not None and not part_name in valid_part_names:
        return "Error: part " + part_name + " is not in this board"

    form = settings_form.PartSettingForm()

    part_setting_index: int | None = None
    for i, existing_part_setting in enumerate(board_settings.part_settings):
        if existing_part_setting.name_regex == part_name:
            part_setting_index = i
            break

    # map form to settings entity
    if form.validate_on_submit():
        part_setting = settings.PartSetting(
            name_regex=part_name,
            top_direction=form.top_direction.data,
            length="Hole" if form.create_hole.data else form.length.data,
            offset_x=form.offset_x.data,
            offset_y=form.offset_y.data,
            offset_z=form.offset_z.data,
            width="Auto" if form.width_auto.data else form.width.data,
            height="Auto" if form.height_auto.data else form.height.data,
        )

        if part_setting_index is not None:
            # replace 
            board_settings.part_settings[part_setting_index] = part_setting
        else:
            # add 
            board_settings.part_settings.append(part_setting)

        project_repository.store_board_settings(project_id, version, board_settings)
        print("Stored part {} settings in project {} version {}".format(part_name, project_id, version))

    # map entity to form (if exists)
    if not form.is_submitted() and part_setting_index is not None:
        part_setting = board_settings.part_settings[part_setting_index]
        form.top_direction.data = part_setting.top_direction
        form.length.data = part_setting.length
        form.create_hole.data = part_setting.length == "Hole"
        form.offset_x.data = part_setting.top_direction
        form.offset_y.data = part_setting.top_direction
        form.offset_z.data = part_setting.top_direction
        form.width_auto.data = part_setting.width == "Auto"
        form.width.data = None if form.width_auto.data else part_setting.width
        form.height_auto.data = part_setting.height == "Auto"
        form.height.data = None if form.height_auto.data else part_setting.height
        form.pcb_tolerance_x.data = board_settings.pcb_tolerance.x
        form.pcb_tolerance_y.data = board_settings.pcb_tolerance.y
        form.pcb_tolerance_z.data = board_settings.pcb_tolerance.z
        print("Loaded part {} settings in project {} version {}".format(part_name, project_id, version))

    return render_template("./partials/part_settings_form.html",
        project_id=project_id,
        part_name=part_name,
        form=form,
    )


@bp.route("/<project_id>/case", methods=["POST"])
def generate_case(project_id: str):
    version = get_version()
    tasks.run_generate_case.delay(upload_root(), project_id, version)
    return redirect(url_for("projects.view_case", project_id=project_id, version=version))


@bp.route("/<project_id>/case")
def view_case(project_id: str):
    version = get_version()
    return render_template("./pages/projects/case.html",
        project_id=project_id,
        version=version,
        glb_path=url_for("projects.case", format="glb", project_id=project_id, version=version)
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
    project_repository = ProjectRepository(upload_root())
    file_path = os.path.join(project_repository.cache_path(project_id), "board.glb")

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)


@bp.route("/<project_id>/case.<format>")
def case(project_id: str, format: str):
    if format not in ['glb', 'stl', 'step']:
        return "Invalid file format", 400

    project_repository = ProjectRepository(upload_root())
    file_path = os.path.join(project_repository.export_root(project_id, get_version()), "board." + format)

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)
