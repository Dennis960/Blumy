try:
    from ocp_vscode import show_object
except ImportError:
    show_object = lambda *any: None
from utils import load_parts
from components import battery_springs
import cadquery as cq
from board_converter import convert_if_needed

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


###----------------- Board + Components (Original) -----------------###
board = cq.importers.importStep("ESPlant-Case/v3/ESPlant-Board.step")


###----------------- Board + Components (Boxes) -----------------###
parts_exclude = ["PinHeader"]
parts_keep_original_shape = ["ESPlant-Board_PCB"]

parts, part_bounding_boxes, part_names = load_parts(parts_exclude=parts_exclude)

def part_index_of(name: str):
    for i, part_name in enumerate(part_names):
        if name in part_name:
            return i
    raise ValueError(f"Part with name {name} not found")

for i in range(len(parts)):
    if any(part_keep_shape in part_names[i] for part_keep_shape in parts_keep_original_shape):
        part_bounding_boxes[i] = parts[i].faces("<Z").wires().toPending().extrude(-board_tolerance_z)
    else:
        part_bounding_boxes[i] = part_bounding_boxes[i].union(part_bounding_boxes[i].faces("<Z").shell(part_tolerance, kind="intersection"))

# esp_index = part_index_of("ESP32")
# esp_box = part_bounding_boxes[esp_index]
# part_bounding_boxes[esp_index] = esp_box.union(esp_box.shell(esp_tolerance, kind="intersection"))
pcb = parts[part_index_of("ESPlant-Board_PCB")]
show_object(pcb.findSolid(), name="pcb")

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
