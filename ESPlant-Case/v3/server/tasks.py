import os
import time
import cadquery as cq
from celery import shared_task
from part_loader import load_parts
from bottom_case import BottomCase

from board_converter import convert
from . import utils

@shared_task
def run_convert(project_id: str, file_name: str):
    start = time.time()
    print("converting " + project_id + " " + file_name)
    root_path = utils.get_project_directory(project_id)
    board_step_path = convert(os.path.join(root_path, file_name), utils.get_project_cache_path(project_id))
    original_board = cq.importers.importStep(board_step_path)
    assembly = cq.Assembly()
    assembly.add(original_board)
    assembly.save(utils.get_project_export_glb_path(project_id), "GLTF", tolerance=0.1, angularTolerance=0.1) # TODO tolerances
    print("converted " + project_id + " in " + str(time.time() - start) + "s")


@shared_task
def run_generate_bottom_case(project_id: str, version: int):
    start = time.time()
    print("generating bottom case " + project_id)

    config = utils.read_config(project_id, version)

    part_list = load_parts(exclude=config.parts_to_ignore_in_case_generation, parts_directory=utils.get_project_cache_path(project_id))
    for additional_part in config.list_of_additional_parts:
        part_list.add_part(additional_part)
    part_list.apply_part_tolerances(config.part_tolerance)
    part_list.apply_pcb_tolerance(
        cq.Vector(config.pcb_tolerance), config.should_use_fixation_holes, config.fixation_hole_diameter, config.hole_fit_tolerance,
            5, 1.6, 0.5 # TODO add these values to config
    )
    part_list.apply_settings(config.part_settings)
    bottom_case = BottomCase(part_list)
    bottom_case.override_dimension(config.bottom_case_dimension)
    bottom_case.override_offset(config.bottom_case_offset)
    bottom_case_cq_object = bottom_case.generate_case(
        config.case_wall_thickness, config.case_floor_height
    )

    assembly = cq.Assembly()
    assembly.add(bottom_case_cq_object)

    export_base = utils.get_project_version_export_base_path(project_id, version)
    assembly.save(export_base + ".glb", "GLTF")
    assembly.save(export_base + ".step", "STEP")
    assembly.save(export_base + ".stl", "STL")

    print("generated bottom case in " + str(time.time() - start) + "s")