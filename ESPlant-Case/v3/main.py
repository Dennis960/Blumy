from ocp_vscode import show_object
from part_loader import load_parts
from components import battery_springs
import cadquery as cq
from board_converter import convert
from typing import List
from geometry import Vector
from cq_part import PartSetting, HOLE_TYPE, DIMENSION_TYPE, ALIGNMENT, Part
from bottom_case import BottomCase

import logging

logging.basicConfig(level=logging.INFO)

### ----------------- Settings -----------------###
case_wall_thickness = 1.5
case_floor_height = 8 + 1.6
hole_fit_tolerance = 0.1
pcb_tolerance = Vector(
    1.5, 1.5, 0.5
)  # having different tolerances for x and y is not supported
part_tolerance = 1

should_use_fixation_holes = True
fixation_hole_diameter = 2.0

parts_to_ignore_in_case_generation = ["PinHeader"]
part_settings: List[PartSetting] = [
    PartSetting(".*", ">Z", pcb_tolerance.z),
    PartSetting(".*", "<Z", pcb_tolerance.z),
    PartSetting(".*MICRO-USB.*", ">X", HOLE_TYPE.HOLE, width=11, height=6.5),
    PartSetting(".*SW-SMD_4P.*", ">Z", HOLE_TYPE.HOLE),
    PartSetting(".*SW-SMD_MK.*", ">Z", HOLE_TYPE.HOLE, offset_y=-2, height=10),
    PartSetting(".*LED.*", ">Z", HOLE_TYPE.HOLE),
    PartSetting(".*ALS-PT19.*", ">Z", HOLE_TYPE.HOLE),
    PartSetting(".*PCB.*", "<Z", HOLE_TYPE.HOLE),
    PartSetting(".*ESP.*", "<Z", HOLE_TYPE.HOLE),
    PartSetting(".*ESP.*", ">Z", 2),
]

# Optional: Specify the max size and offset of the case (for letting a part of the pcb stick out)
bottom_case_dimension = (DIMENSION_TYPE.AUTO, 62, DIMENSION_TYPE.AUTO)
bottom_case_offset = (0, ALIGNMENT.POSITIVE, 0)

list_of_additional_parts: List[Part] = [
    Part(
        "Battery Springs",
        battery_springs.val().BoundingBox(),
        battery_springs,
        battery_springs,
    ),
]

### ----------------- Importing kicad_pcb -----------------###

# Converts the pcb board and generates the parts.json file if it doesn't exist yet
board_step_path = convert("ESPlant-Board/ESPlant-Board.kicad_pcb")

### ----------------- Board + Components (Original) -----------------###
original_board = cq.importers.importStep(board_step_path)
for additional_part in list_of_additional_parts:
    original_board = original_board.union(additional_part.cq_object)

### ----------------- Board + Components (Boxes) -----------------###
part_list = load_parts(exclude=parts_to_ignore_in_case_generation)
for additional_part in list_of_additional_parts:
    part_list.add_part(additional_part)
part_list.apply_part_tolerances(part_tolerance)
part_list.apply_pcb_tolerance(
    pcb_tolerance, should_use_fixation_holes, fixation_hole_diameter, hole_fit_tolerance
)
part_list.apply_settings(part_settings)

### ----------------- Case -----------------###
bottom_case = BottomCase(part_list)
bottom_case.override_dimension(bottom_case_dimension)
bottom_case.override_offset(bottom_case_offset)
bottom_case_cq_object = bottom_case.generate_case(
    case_wall_thickness, case_floor_height
)

### ----------------- Preview -----------------###
show_object(original_board, name="board")
show_object(bottom_case_cq_object, name="case_bottom")

### ----------------- Export -----------------###
# cq.Assembly(bottom_case_cq_object).save(filename)
