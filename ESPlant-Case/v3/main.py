try:
    from ocp_vscode import show_object
except ImportError:
    show_object = lambda *any: None
from part_loader import load_parts
from components import battery_springs
import cadquery as cq
from board_converter import convert
import re
from dataclasses import dataclass
from typing import List
from utils import extrude_part_faces, extrude_part_width, extrude_part_height
from pcb import make_offset_shape
from geometry import Vector
from enum import Enum
from OCP.TopoDS import TopoDS_Shape, TopoDS_Wire, TopoDS_Edge
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_EDGE, TopAbs_WIRE
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.GeomAbs import GeomAbs_Circle

import logging
logging.basicConfig(level=logging.INFO)

class HOLE_TYPE(Enum):
    HOLE = "HOLE"
class DIMENSION_TYPE(Enum):
    AUTO = "AUTO"
class ALIGNMENT(Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"

# Converts the pcb board and generates the parts.json file if it doesn't exist yet
board_step_path = convert("ESPlant-Board/ESPlant-Board.kicad_pcb")

@dataclass
class PartSetting:
    name: str
    direction: cq.Selector = None
    length: float | HOLE_TYPE = None
    offset_x: float = 0
    offset_y: float = 0
    offset_z: float = 0
    width: float = DIMENSION_TYPE.AUTO
    height: float = DIMENSION_TYPE.AUTO

###----------------- Settings -----------------###
minimum_wall_thickness = 1.5
hole_tolerance = 0.1
board_tolerance = Vector(1.5, 1.5, 0.5)
part_tolerance = 1

use_fixation_holes = True
fixation_hole_diameter = 2.0

case_hole_extrusion_size = 50

# List of all parts that should be ignored when generating the case
parts_to_ignore_in_case_generation = ["PinHeader"]
# List of all parts that have an irregular shape and should not be averaged to a box
PCB_PART_NAME = "PCB"
# List of all parts that need a hole in the bottom case
# Name to find the part (empty for all parts)
# Direction where the hole should be
# Length of the hole (HOLE means through the entire case, else it is just an indentation)
# Offset in x/y/z direction
# Minimum width/height of the hole (e.g. for the micro-usb port we need a bigger hole because the rubber of the cable is thicker)
part_settings: List[PartSetting] = [
    PartSetting("", ">Z", board_tolerance.z),
    PartSetting("", "<Z", board_tolerance.z),
    PartSetting("MICRO-USB", ">X", HOLE_TYPE.HOLE, width=11, height=6.5),
    PartSetting("SW-SMD_4P", ">Z", HOLE_TYPE.HOLE),
    PartSetting("SW-SMD_MK", ">Z", HOLE_TYPE.HOLE, offset_y=-2, height=10),
    PartSetting("LED", ">Z", HOLE_TYPE.HOLE),
    PartSetting("ALS-PT19", ">Z", HOLE_TYPE.HOLE),
    PartSetting("PCB", "<Z", HOLE_TYPE.HOLE),
    PartSetting("ESP", "<Z", HOLE_TYPE.HOLE),
    PartSetting("ESP", ">Z", 2),
]

# Optional: Specify the max size and offset of the case (for letting a part of the pcb stick out)
case_dimension = {"x": DIMENSION_TYPE.AUTO, "y": 62, "z": DIMENSION_TYPE.AUTO}
case_offset = {"x": 0, "y": ALIGNMENT.POSITIVE, "z": 0}

###----------------- Board + Components (Original) -----------------###
board = cq.importers.importStep(board_step_path)
board = board.union(battery_springs)


###----------------- Board + Components (Boxes) -----------------###
part_list = load_parts(exclude=parts_to_ignore_in_case_generation)

for part in part_list.parts:
    if PCB_PART_NAME in part.name:
        part.cq_bounding_box = make_offset_shape(part.cq_object, board_tolerance, use_fixation_holes, fixation_hole_diameter, hole_tolerance)
    else:
        part.cq_bounding_box = part.cq_bounding_box.union(part.cq_bounding_box.faces("<Z").shell(part_tolerance, kind="intersection"))

parts_hole_extrusions = []

for part_setting in part_settings:
    part_name = part_setting.name
    extrude_dir = part_setting.direction
    is_hole_extrusion = part_setting.length is HOLE_TYPE.HOLE
    extrude_len = case_hole_extrusion_size if is_hole_extrusion else part_setting.length
    parts = part_list.find_all_by_name_regex(part_name)
    for part in parts:
        extrusion = extrude_part_faces(extrude_dir, part.cq_bounding_box, extrude_len)
        if part_setting.width is not DIMENSION_TYPE.AUTO:
            extrusion = extrude_part_width(extrusion, part_setting.width, extrude_dir)
        if part_setting.height is not DIMENSION_TYPE.AUTO:
            extrusion = extrude_part_height(extrusion, part_setting.height, extrude_dir)
        extrusion = extrusion.translate((part_setting.offset_x, part_setting.offset_y, part_setting.offset_z))
        if is_hole_extrusion:
            parts_hole_extrusions.append(extrusion)
        else:
            part.cq_bounding_box = part.cq_bounding_box.union(extrusion)

# combine all parts into one object
part_union = cq.Workplane("XY")
for part in part_list.parts:
    part_union = part_union.union(part.cq_bounding_box)
part_union = part_union.union(battery_springs)

###----------------- Case -----------------###
# get bounding box of all parts
part_union_bounding_box = part_union.val().BoundingBox()
part_union_center = part_union.val().CenterOfBoundBox()
case_dimension = {
    "x": part_union_bounding_box.xlen if case_dimension["x"] is DIMENSION_TYPE.AUTO else case_dimension["x"],
    "y": part_union_bounding_box.ylen if case_dimension["y"] is DIMENSION_TYPE.AUTO else case_dimension["y"],
    "z": part_union_bounding_box.zlen if case_dimension["z"] is DIMENSION_TYPE.AUTO else case_dimension["z"],
}
case_offset = {
    "x": part_union_bounding_box.xlen / 2 - case_dimension["x"] /2 if case_offset["x"] is ALIGNMENT.POSITIVE else - part_union_bounding_box.xlen / 2 + case_dimension["x"] /2 if case_offset["x"] is ALIGNMENT.NEGATIVE else case_offset["x"],
    "y": part_union_bounding_box.ylen / 2 - case_dimension["y"] /2 if case_offset["y"] is ALIGNMENT.POSITIVE else - part_union_bounding_box.ylen / 2 + case_dimension["y"] /2 if case_offset["y"] is ALIGNMENT.NEGATIVE else case_offset["y"],
    "z": part_union_bounding_box.zlen / 2 - case_dimension["z"] /2 if case_offset["z"] is ALIGNMENT.POSITIVE else - part_union_bounding_box.zlen / 2 + case_dimension["z"] /2 if case_offset["z"] is ALIGNMENT.NEGATIVE else case_offset["z"],
}
part_union_box = cq.Workplane("XY").box(case_dimension["x"], case_dimension["y"], case_dimension["z"]).translate((part_union_center.x, part_union_center.y, part_union_center.z))
part_union_box = part_union_box.translate((case_offset["x"], case_offset["y"], case_offset["z"]))
part_union_shell = part_union_box.faces("<Z").shell(minimum_wall_thickness, kind="intersection")

part_union_shell = part_union_shell.union(extrude_part_faces("<Z", part_union_shell, 8, faces_selector=">Z[-2]"))

# cut out holes and parts
part_union_shell = part_union_shell.cut(part_union)
for part_hole_extrusion in parts_hole_extrusions:
    part_union_shell = part_union_shell.cut(part_hole_extrusion)

# TODO use holes to fixate the case

###----------------- Preview -----------------###
show_object(board, name="board")
# show_object(part_union, name="part_union")
show_object(part_union_shell, name="case_bottom")

###----------------- Export -----------------###
# cq.Assembly(part_union_shell).save(filename)
