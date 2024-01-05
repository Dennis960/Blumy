import time
from celery import shared_task
import cadquery as cq

from server.project_repository import ProjectRepository


@shared_task
def run_convert(root: str, project_id: str):
    # Needs to be imported here to avoid segmentation faults caused by _bool_op, see https://github.com/CadQuery/cadquery/issues/1354, https://github.com/celery/celery/issues/3398
    import sys
    print(sys.path)
    from casemaker.casemaker import CasemakerLoader

    start = time.time()

    project_repository = ProjectRepository(root)
    pcb_path = project_repository.pcb_path(project_id)

    print("converting " + project_id + " " + pcb_path)
    CasemakerLoader(project_repository.cache_path(project_id))\
        .load_kicad_pcb(pcb_path, project_repository.step_filename())\
        .save_pickle()\
        .save_gltf_file()
    print("converted " + project_id + " in " + str(time.time() - start) + "s")


@shared_task
def run_generate_case(root: str, project_id: str, version: int):
    # Needs to be imported here to avoid segmentation faults caused by _bool_op, see https://github.com/CadQuery/cadquery/issues/1354, https://github.com/celery/celery/issues/3398
    from casemaker.casemaker import CasemakerLoader
    start = time.time()
    print("generating bottom case " + project_id + " " + str(version))

    project_repository = ProjectRepository(root)
    board_settings = project_repository.load_board_settings(project_id, version)
    case_settings = project_repository.load_case_settings(project_id, version)

    print(case_settings)

    casemaker = CasemakerLoader(project_repository.cache_path(project_id))\
            .load_pickle()\
            .generate_board(board_settings)\
            .generate_case(case_settings)

    # casemaker.add_compartment_door() # (optional) TODO compartment door settings
    # casemaker.add_battery_holder() # (optional) TODO battery holder settings

    assembly = cq.Assembly(
        casemaker.case.case_cq_object, name="case")

    export_base = project_repository.export_base(project_id, version)
    assembly.save(export_base + ".glb", "GLTF")
    assembly.save(export_base + ".step", "STEP")
    assembly.save(export_base + ".stl", "STL")

    print("generated bottom case in " + str(time.time() - start) + "s")
