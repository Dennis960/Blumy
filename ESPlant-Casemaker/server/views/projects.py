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
    return int(request.args.get("version", 0))


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

    return redirect(url_for(
        "projects.view_board",
        project_id=project_id,
        version=0
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
    form.pcb_part_name.data = pcb_part_names[0] if pcb_part_names else None
    # set a default name
    form.name.data = pcb_part_names[0] if pcb_part_names else ""

    # map form to settings entity
    if form.validate_on_submit():
        pcb_tolerance = cq.Vector(*form.pcb_tolerance.data)
        board_settings = settings.BoardSettings(
            name=form.name.data,
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
        form.name.data = board_settings.name
        form.pcb_tolerance.entries[0].data = board_settings.pcb_tolerance.x
        form.pcb_tolerance.entries[1].data = board_settings.pcb_tolerance.y
        form.pcb_tolerance.entries[2].data = board_settings.pcb_tolerance.z
        form.part_tolerance.data = board_settings.part_tolerance
        form.pcb_part_name.data = board_settings.pcb_part_name
        form.exclude.data = board_settings.exclude
        form.parts_without_tolerances.data = board_settings.parts_without_tolerances
        print("Loaded board settings in project {} version {}".format(project_id, version))

    return render_template("./partials/board_settings_form.html",
        project_id=project_id,
        version=version,
        form=form,
    )


@bp.route("/<project_id>/part-settings", methods=['GET', 'POST'])
def part_settings_form(project_id: str):
    # TODO validate that project and board exist
    version = get_version()

    project_repository = ProjectRepository(upload_root())
    board_settings = project_repository.load_board_settings(project_id, version)

    if board_settings is None:
        return render_template("./partials/settings_error.html",
            message="Save board settings first",
            version=version
        )

    # TODO escape part_name as regex
    part_name = request.args.get("part")

    if part_name is None:
        return render_template("./partials/settings_error.html",
            message="Click on a part to edit its settings",
            version=version,
        )

    board = CasemakerLoader(project_repository.cache_path(project_id))\
        .load_pickle()
    valid_part_names = list(board.shapes_dict.keys())

    if not part_name in valid_part_names:
        return render_template("./partials/settings_error.html",
            message="Part " + part_name + " is not in this board",
            version=version
        )

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
            offset_x=form.offset.data[0],
            offset_y=form.offset.data[1],
            offset_z=form.offset.data[2],
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
        form.create_hole.data = part_setting.length == "Hole"
        form.length.data = part_setting.length if not form.create_hole.data else None
        form.offset.entries[0].data = part_setting.offset_x
        form.offset.entries[1].data = part_setting.offset_y
        form.offset.entries[2].data = part_setting.offset_z
        form.width_auto.data = part_setting.width == "Auto"
        form.width.data = part_setting.width if part_setting.width != "Auto" else None
        form.height_auto.data = part_setting.height == "Auto"
        form.height.data = part_setting.height if part_setting.height != "Auto" else None

        print("Loaded part {} settings in project {} version {}".format(part_name, project_id, version))

    print(form.length.data)
    print(form.offset.data)

    return render_template("./partials/part_settings_form.html",
        project_id=project_id,
        part_name=part_name,
        version=version,
        form=form,
    )


@bp.route("/<project_id>/case", methods=["POST"])
def generate_case(project_id: str):
    project_repository = ProjectRepository(upload_root())
    version = project_repository.increment_version(project_id, get_version())
    tasks.run_generate_case.delay(upload_root(), project_id, version)
    return redirect(url_for("projects.view_case", project_id=project_id, version=version))


@bp.route("/<project_id>/case-settings", methods=['GET', 'POST'])
def case_settings_form(project_id: str):
    # TODO validate that project and board exist
    version = get_version()

    form = settings_form.CaseSettingsForm()

    project_repository = ProjectRepository(upload_root())
    case_settings = project_repository.load_case_settings(project_id, version)

    # map form to settings entity
    if form.validate_on_submit():
        pcb_slot_settings = settings.PcbSlotSettings(
            side=settings.SIDE[form.pcb_slot_side.data],
            should_include_components=form.pcb_should_include_components.data,
            use_tolerance=form.pcb_use_tolerance.data
        )

        case_settings = settings.CaseSettings(
            case_wall_thickness=form.case_wall_thickness.data,
            case_floor_pad=form.case_floor_pad.data,
            case_dimension=(
                "Auto" if form.case_dimension_x_auto.data else form.case_dimension.data[0],
                "Auto" if form.case_dimension_y_auto.data else form.case_dimension.data[1],
                "Auto" if form.case_dimension_z_auto.data else form.case_dimension.data[2]
            ),
            case_offset=(
                "Positive" if form.case_offset_x_positive.data else "Negative" if form.case_offset_x_negative.data else form.case_offset.data[0],
                "Positive" if form.case_offset_y_positive.data else "Negative" if form.case_offset_y_negative.data else form.case_offset.data[1],
                "Positive" if form.case_offset_z_positive.data else "Negative" if form.case_offset_z_negative.data else form.case_offset.data[2]
            ),
            pcb_slot_settings=pcb_slot_settings
        )

        project_repository.store_case_settings(project_id, version, case_settings)
        print("Stored case settings in project {} version {}".format(project_id, version))

    # map entity to form (if exists)
    if not form.is_submitted() and case_settings is not None:
        form.case_wall_thickness.data = case_settings.case_wall_thickness
        form.case_floor_pad.data = case_settings.case_floor_pad
        form.case_dimension.entries[0].data = case_settings.case_dimension[0] if case_settings.case_dimension[0] != "Auto" else None
        form.case_dimension_x_auto.data = case_settings.case_dimension[0] == "Auto"
        form.case_dimension.entries[1].data = case_settings.case_dimension[1] if case_settings.case_dimension[1] != "Auto" else None
        form.case_dimension_y_auto.data = case_settings.case_dimension[1] == "Auto"
        form.case_dimension.entries[2].data = case_settings.case_dimension[2] if case_settings.case_dimension[2] != "Auto" else None
        form.case_dimension_z_auto.data = case_settings.case_dimension[2] == "Auto"
        form.case_offset.entries[0].data = case_settings.case_offset[0] if case_settings.case_offset[0] != "Positive" and case_settings.case_offset[0] != "Negative" else None
        form.case_offset_x_positive.data = case_settings.case_offset[0] == "Positive"
        form.case_offset_x_negative.data = case_settings.case_offset[0] == "Negative"
        form.case_offset.entries[1].data = case_settings.case_offset[1] if case_settings.case_offset[1] != "Positive" and case_settings.case_offset[1] != "Negative" else None
        form.case_offset_y_positive.data = case_settings.case_offset[1] == "Positive"
        form.case_offset_y_negative.data = case_settings.case_offset[1] == "Negative"
        form.case_offset.entries[2].data = case_settings.case_offset[2] if case_settings.case_offset[2] != "Positive" and case_settings.case_offset[2] != "Negative" else None
        form.case_offset_z_positive.data = case_settings.case_offset[2] == "Positive"
        form.case_offset_z_negative.data = case_settings.case_offset[2] == "Negative"
        form.pcb_slot_side.data = case_settings.pcb_slot_settings.side
        form.pcb_should_include_components.data = case_settings.pcb_slot_settings.should_include_components
        form.pcb_use_tolerance.data = case_settings.pcb_slot_settings.use_tolerance

        print("Loaded case settings in project {} version {}".format(project_id, version))

    return render_template("./partials/case_settings_form.html",
        project_id=project_id,
        version=version,
        form=form,
    )


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
    # TODO BoardRenderer sometimes throws CONTENT_LENGTH_MISMATCH, probably when the file gets served while still being written
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
    file_path = project_repository.export_base(project_id, get_version()) + "." + format

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)
