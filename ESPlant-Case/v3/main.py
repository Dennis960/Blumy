try:
    from ocp_vscode import show_object
except ImportError:
    show_object = lambda *any: None
from utils import load_part_data, import_part_step
from components import battery_springs
import cadquery as cq
from typing import List

###----------------- General tolerances -----------------###
minimum_width = 0.5
minimum_wall_thickness = 1.5
closure_tolerance = 0.5
hole_tolerance = 0.1
board_tolerance_xy = 1.5
board_tolerance_z = 0.5
part_tolerance = 1

###----------------- Board + Components -----------------###

part_data = load_part_data()
# regex for parts to skip
parts_to_skip = ["PinHeader"]
parts: List[cq.Workplane] = []
bounding_box_parts: List[cq.Workplane] = []
part_names: List[str] = []

for part in part_data:
    if any(part_to_skip in part.name for part_to_skip in parts_to_skip):
        continue
    part_step = import_part_step(part)
    part_step_center = part_step.val().CenterOfBoundBox()
    parts.append(part_step)
    part_names.append(part.name)
    bounding_box = part_step.val().BoundingBox()
    bounding_box_part = cq.Workplane("XY").box(bounding_box.xlen, bounding_box.ylen, bounding_box.zlen).translate((part_step_center.x, part_step_center.y, part_step_center.z))
    bounding_box_parts.append(bounding_box_part)

def part_index_of(name: str):
    for i, part_name in enumerate(part_names):
        if name in part_name:
            return i
    return 0

part_tolerace_shells: List[cq.Workplane] = []

board_index = part_index_of("ESPlant-Board_PCB")
part_tolerace_shells.append(bounding_box_parts[board_index].faces("<Z or >Z").shell(board_tolerance_xy, kind="intersection"))

###----------------- Case bottom -----------------###


###----------------- Case top -----------------###


###----------------- Case over -----------------###

###----------------- Preview -----------------###

for part_name, bounding_box_part in zip(part_names, bounding_box_parts):
    show_object(bounding_box_part, name=part_name)
for part_name, part_tolerace_shell in zip(part_names, part_tolerace_shells):
    show_object(part_tolerace_shell, name=part_name + "_tolerance_shell")
show_object(battery_springs, name="battery_springs")
# show_object(parts, name="parts")

###----------------- Export -----------------###
# cq.Assembly(board).save("board.step")
