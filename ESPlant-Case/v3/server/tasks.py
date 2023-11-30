import os
import time
import cadquery as cq
from celery import shared_task
from part_loader import load_parts
from bottom_case import BottomCase

from board_converter import convert
from . import parameters

@shared_task
def run_convert(root_path: str, file_name: str):
    start = time.time()
    print("converting " + root_path + " " + file_name)
    board_step_path = convert(os.path.join(root_path, file_name), os.path.join(root_path, "cache"))
    original_board = cq.importers.importStep(board_step_path)
    assembly = cq.Assembly()
    assembly.add(original_board)
    export_path = os.path.join(root_path, "board.glb")
    assembly.save(export_path, "GLTF", tolerance=0.1, angularTolerance=0.1) # TODO tolerances
    print("converted " + export_path + " in " + str(time.time() - start) + "s")


@shared_task
def run_generate_bottom_case(root_path: str, config: parameters.CaseConfiguration):
    start = time.time()
    print("generating bottom case " + root_path)

    parts_path = os.path.join(root_path, "cache")

    part_list = load_parts(exclude=config.parts_to_ignore_in_case_generation, parts_directory=parts_path)
    for additional_part in config.list_of_additional_parts:
        part_list.add_part(additional_part)
    part_list.apply_part_tolerances(config.part_tolerance)
    part_list.apply_pcb_tolerance(
        cq.Vector(config.pcb_tolerance), config.should_use_fixation_holes, config.fixation_hole_diameter, config.hole_fit_tolerance
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

    export_path = os.path.join(root_path, "bottom-case.glb")
    assembly.save(export_path, "GLTF", tolerance=0.1, angularTolerance=0.1) # TODO tolerances

    print("generated bottom case in " + str(time.time() - start) + "s")