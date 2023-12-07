from ocp_vscode import show_all
from part_loader import load_parts
from components import battery_springs
import cadquery as cq
from board_converter import convert
from typing import List
from geometry import Vector
from cq_part import PartSetting, HOLE_TYPE, DIMENSION_TYPE, ALIGNMENT, Part
from bottom_case import BottomCase
from compartment_door import CompartmentDoor, CompartmentDoorSettings
from battery_holder import BatteryHolderSettings, BatteryHolder

import logging

logging.basicConfig(level=logging.INFO)

### ----------------- Settings -----------------###
case_wall_thickness = 1.5
case_floor_max_thickness = 8 + 1.6

# Optional: Specify the max size and offset of the case (for letting a part of the pcb stick out)
bottom_case_dimension = (DIMENSION_TYPE.AUTO, 62, 12)
bottom_case_offset = (0, ALIGNMENT.POSITIVE, ALIGNMENT.POSITIVE)

should_use_fixation_holes = True
fixation_hole_tolerance = 0.1
fixation_hole_diameter = 2.0

pcb_tolerance = Vector(
    1.5, 1.5, 0.5
)  # having different tolerances for x and y is not supported
part_tolerance = 1
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
pcb_thickness = 1.6
pcb_thickness = 1.6
pcb_thickness = 1.6


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
    pcb_tolerance, should_use_fixation_holes, fixation_hole_diameter, fixation_hole_tolerance
)
part_list.apply_settings(part_settings)

### ----------------- Case -----------------###
bottom_case = BottomCase(part_list)
bottom_case.override_dimension(bottom_case_dimension)
bottom_case.override_offset(bottom_case_offset)
bottom_case_cq_object = bottom_case.generate_case(
    case_wall_thickness, case_floor_max_thickness
)

bottom_case_bounds = bottom_case_cq_object.val().BoundingBox()
bottom_case_open_face_bb = bottom_case_cq_object.faces(
    "<Z").val().BoundingBox()

compartment_door_settings = CompartmentDoorSettings(
    compartment_door_dimensions=(
        bottom_case_open_face_bb.xlen - 2 * case_wall_thickness, bottom_case_open_face_bb.ylen - 2 * case_wall_thickness, 1.5),
    tab_spacing_factor=0.8
)
compartment_door = CompartmentDoor(compartment_door_settings)

# flip the compartment door
compartment_door.flip()
# move the compartment door to the top of the case
compartment_door.move(
    bottom_case_open_face_bb.center.x,
    bottom_case_open_face_bb.center.y,
    bottom_case_open_face_bb.center.z + 0.5 * case_wall_thickness,
)

bottom_case_cq_object = bottom_case_cq_object.union(compartment_door.frame).cut(
    compartment_door.door_with_tolerance).cut(bottom_case.get_cuts())
compartment_door.door = compartment_door.door.cut(original_board)


### ----------------- Battery Holder -----------------###

battery_holder = BatteryHolder(
    BatteryHolderSettings(front_wall_thickness=2.5,
                          back_wall_thickness=1.5, insertable_springs_thickness=1, polartiy_text_spacing=0.3, battery_length_tolerance=4))
battery_holder.battery_holder = (battery_holder.battery_holder
                                 .rotate((0, 0, 0), (0, 1, 0), 180)
                                 .translate((
                                     bottom_case_open_face_bb.center.x,
                                     bottom_case_open_face_bb.center.y + 1.5,
                                     bottom_case_open_face_bb.zmin))
                                 )
battery_holder.battery_holder = battery_holder.battery_holder.cut(
    original_board)

### ----------------- Preview -----------------###
show_all({
    "board": original_board,
    "case_bottom": bottom_case_cq_object,
    "compartment_door": compartment_door.door,
    "battery_holder": battery_holder.battery_holder,
})

### ----------------- Export -----------------###
cq.Assembly(bottom_case_cq_object.mirror("XY")).save("Case-Bottom.step")
cq.Assembly(compartment_door.door).save("Compartment-Door.step")
cq.Assembly(battery_holder.battery_holder.mirror(
    "XY")).save("Battery-Holder.step")
cq.Assembly(bottom_case_cq_object
            .union(original_board)
            .union(bottom_case_cq_object)
            .union(compartment_door.door)
            .union(battery_holder.battery_holder)
            ).save("Case-do-not-print.step")
