try:
    from ocp_vscode import show_object
except ImportError:
    show_object = lambda *any: None
from utils import load_parts, extrude_part
from components import battery_springs
import cadquery as cq
from board_converter import convert_if_needed
import re

# Converts the pcb board and generates the parts.json file if it doesn't exist yet
convert_if_needed()

###----------------- General tolerances -----------------###
minimum_width = 0.5
minimum_wall_thickness = 1.5
closure_tolerance = 0.5
hole_tolerance = 0.1
board_tolerance_xy = 1.5
board_tolerance_z = 0.5
part_tolerance = 1
esp_tolerance = 5

case_hole_extrusion_size = 50


###----------------- Board + Components (Original) -----------------###
board = cq.importers.importStep("ESPlant-Case/v3/ESPlant-Board.step")


###----------------- Board + Components (Boxes) -----------------###
parts_exclude = ["PinHeader"]
parts_keep_original_shape = ["ESPlant-Board_PCB"]
parts_to_extrude = [
    ["ESP32", ">Z", 5],
    ["ESP32", "<Z", 5],
    ["MICRO-USB", ">X"],
    ["SW-SMD", ">Z"],
    ["LED", ">Z"],
    ["ALS-PT19", ">Z"],
    ["", ">Z", board_tolerance_z],
    ["", "<Z", board_tolerance_z]
]

parts, part_bounding_boxes, part_names = load_parts(parts_exclude=parts_exclude)

def part_indices_of(name_re: str):
    """
    Get the indices of all parts that match the given regular expression.
    """
    return [i for i, part_name in enumerate(part_names) if re.match(name_re, part_name)]

for i in range(len(parts)):
    if any(part_keep_shape in part_names[i] for part_keep_shape in parts_keep_original_shape):
        part_bounding_boxes[i] = parts[i].faces("<Z").wires().toPending().extrude(-board_tolerance_z)
    else:
        part_bounding_boxes[i] = part_bounding_boxes[i].union(part_bounding_boxes[i].faces("<Z").shell(part_tolerance, kind="intersection"))

pcb = parts[part_indices_of("ESPlant-Board_PCB")[0]]
show_object(pcb.findSolid(), name="pcb")

for part_to_extrude in parts_to_extrude:
    part_name = part_to_extrude[0]
    extrude_dir = part_to_extrude[1]
    extrude_len = part_to_extrude[2] if len(part_to_extrude) == 3 else case_hole_extrusion_size
    part_indices = part_indices_of(part_name)
    for part_index in part_indices:
        try:
            print(f"Extruding {part_names[part_index]} {extrude_dir} {extrude_len}mm")
            part_bounding_boxes[part_index] = part_bounding_boxes[part_index].union(extrude_part(extrude_dir, part_bounding_boxes[part_index], extrude_len))
        except Exception as e:
            print(f"Error extruding {part_names[part_index]}: {e}")

###----------------- Preview -----------------###
for part_name, bounding_box_part in zip(part_names, part_bounding_boxes):
    show_object(bounding_box_part, name=part_name)
show_object(battery_springs, name="battery_springs")
# show_object(board, name="board")
# show_object(parts, name="parts")

###----------------- Export -----------------###
objects = part_bounding_boxes + [battery_springs]
assembly = cq.Assembly()
for obj in objects:
    assembly.add(obj)
assembly.save("ESPlant-Case/v3/ESPlant-Case.step")
