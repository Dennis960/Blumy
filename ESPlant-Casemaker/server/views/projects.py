import os
import uuid
from flask import Blueprint, request, render_template, url_for, redirect, send_file
from werkzeug.utils import secure_filename
import cadquery as cq
from flask import current_app
from celery_worker import tasks
from casemaker import settings
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
    return redirect(url_for("projects.view_board", project_id=project_id, version=version))


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
    version = get_version()
    # TODO read previous config and pre-populate form with it

    form = settings_form.BoardSettingsForm()
    parts = ["PCB", "BatterySprings", "PinHeader"] # TODO load board and use part names here
    form.pcb_part_name.choices = parts
    form.exclude.choices = parts
    form.parts_without_tolerances.choices = parts

    if form.validate_on_submit():
        pcb_tolerance = cq.Vector(
            form.data["pcb_tolerance_x"],
            form.data["pcb_tolerance_y"],
            form.data["pcb_tolerance_z"],
        )
        board_settings = settings.BoardSettings(
            pcb_tolerance=pcb_tolerance,
            part_tolerance=form.data["part_tolerance"],
            part_settings=[], # TODO
            pcb_part_name=form.data["pcb_part_name"],
            exclude=form.data["exclude"],
            parts_without_tolerances=form.data["parts_without_tolerances"],
        )

    return render_template("./partials/board_settings_form.html",
        project_id=project_id,
        form=form,
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
    project_repository = ProjectRepository(upload_root())
    file_path = os.path.join(project_repository.cache_path(project_id), "board.glb")

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)


@bp.route("/<project_id>/bottom-case.<format>")
def bottom_case(project_id: str, format: str):
    if format not in ['glb', 'stl', 'step']:
        return "Invalid file format", 400

    project_repository = ProjectRepository(upload_root())
    file_path = os.path.join(project_repository.export_root(project_id, get_version()), "board." + format)

    if not os.path.exists(file_path):
        return "Does not exist on disk", 404

    return send_file(file_path)
