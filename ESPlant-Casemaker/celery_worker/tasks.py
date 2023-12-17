import os
import time
from celery import shared_task
import cadquery as cq

from server import utils


@shared_task
def run_convert(project_id: str, file_name: str):
    # Needs to be imported here to avoid segmentation faults caused by _bool_op, see https://github.com/CadQuery/cadquery/issues/1354, https://github.com/celery/celery/issues/3398
    import sys
    print(sys.path)
    from casemaker.casemaker import CasemakerLoader
    start = time.time()
    print("converting " + project_id + " " + file_name)
    root_path = utils.get_project_directory(project_id)
    casemaker = CasemakerLoader(utils.get_project_cache_path(project_id)).load_kicad_pcb(
        os.path.join(root_path, file_name), "board.step")
    print("saving " + project_id + " " + file_name)
    casemaker.save_gltf_file(utils.get_project_export_glb_path(project_id),
                             tolerance=0.1, angularTolerance=0.1)
    print("converted " + project_id + " in " + str(time.time() - start) + "s")


@shared_task
def run_generate_bottom_case(project_id: str, version: int):
    # Needs to be imported here to avoid segmentation faults caused by _bool_op, see https://github.com/CadQuery/cadquery/issues/1354, https://github.com/celery/celery/issues/3398
    from casemaker.casemaker import CasemakerLoader
    from casemaker.settings import BoardSettings
    start = time.time()
    print("generating bottom case " + project_id)

    config = utils.read_config(project_id, version)

    casemaker = (CasemakerLoader(utils.get_project_cache_path(project_id))
                 .load_step_file(os.path.join(utils.get_project_directory(project_id), "board.step"))
                 )
    casemaker_with_board = casemaker.generate_board(BoardSettings(exclude=[
        # *config.parts_to_ignore_in_case_generation TODO
    ]))  # TODO board settings
    casemaker_with_case = casemaker_with_board.generate_case()  # TODO case settings
    # casemaker_with_case.add_compartment_door() # (optional) TODO compartment door settings
    # casemaker_with_case.add_battery_holder() # (optional) TODO battery holder settings

    assembly = cq.Assembly(
        casemaker_with_case.case.case_cq_object, name="case")

    export_base = utils.get_project_version_export_base_path(
        project_id, version)
    assembly.save(export_base + ".glb", "GLTF")
    assembly.save(export_base + ".step", "STEP")
    assembly.save(export_base + ".stl", "STL")

    print("generated bottom case in " + str(time.time() - start) + "s")