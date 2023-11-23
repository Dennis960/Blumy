try:
    from ocp_vscode import show_object
except ImportError:
    show_object = lambda *any: None
from utils import load_parts, extrude_part_faces, extrude_part_width, extrude_part_height
from components import battery_springs
import cadquery as cq
from board_converter import convert_if_needed
import re
from OCP.TopoDS import TopoDS_Shape, TopoDS_Wire, TopoDS_Edge
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_EDGE, TopAbs_WIRE
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.GeomAbs import GeomAbs_Circle

# Converts the pcb board and generates the parts.json file if it doesn't exist yet
convert_if_needed()

###----------------- Settings -----------------###
filename = "ESPlant-Case/v3/ESPlant-Case.step"
# minimum_width = 0.5
minimum_wall_thickness = 1.5
# closure_tolerance = 0.5
hole_tolerance = 0.1
board_tolerance_xy = 1.5
board_tolerance_z = 0.5
part_tolerance = 1

fixation_hole_diameter = 2.0

case_hole_extrusion_size = 50

HOLE = None
# List of all parts that should not be included when generating the case
parts_to_exclude_from_pcb = ["PinHeader"]
# List of all parts that have an irregular shape and should not be averaged to a box
parts_to_keep_original_shape = ["PCB"]
# List of all parts that need a hole in the bottom case
# Name to find the part (empty for all parts)
# Direction where the hole should be
# Length of the hole (HOLE means through the entire case, else it is just an indentation)
# Offset in x/y/z direction
# Minimum width/height of the hole (e.g. for the micro-usb port we need a bigger hole because the rubber of the cable is thicker)
parts_to_extrude_for_case_bottom = [
    {"name": "", "direction": ">Z", "length": board_tolerance_z},
    {"name": "", "direction": "<Z", "length": board_tolerance_z},
    {"name": "MICRO-USB", "direction": ">X", "length": HOLE, "min_width": 11, "min_height": 6.5},
    {"name": "SW-SMD_4P", "direction": ">Z", "length": HOLE},
    {"name": "SW-SMD_MK", "direction": ">Z", "length": HOLE, "offset_y": -2, "min_height": 10},
    {"name": "LED", "direction": ">Z", "length": HOLE},
    {"name": "ALS-PT19","direction": ">Z", "length": HOLE},
    {"name": "PCB","direction": "<Z", "length": HOLE},
    {"name": "ESP","direction": "<Z", "length": HOLE},
    {"name": "ESP","direction": ">Z", "length": 2},
]

case_height = 62

###----------------- Board + Components (Original) -----------------###
board = cq.importers.importStep("ESPlant-Case/v3/ESPlant-Board.step")
board = board.union(battery_springs)


###----------------- Board + Components (Boxes) -----------------###
parts_raw, parts_boxes, parts_names = load_parts(parts_exclude=parts_to_exclude_from_pcb)

def part_indices_of(name_re: str):
    """
    Get the indices of all parts that include the given regular expression.
    """
    return [i for i, part_name in enumerate(parts_names) if re.match(f".*{name_re}.*", part_name)]

for i in range(len(parts_raw)):
    if any(part_keep_shape in parts_names[i] for part_keep_shape in parts_to_keep_original_shape):
        # TODO extract this as a pcb specific function as it won't work for any other shape
        orig_shape: TopoDS_Shape = parts_raw[i].val().wrapped
        explorer = TopExp_Explorer(orig_shape, TopAbs_WIRE)
        wires = []
        while explorer.More():
            wire: TopoDS_Wire = explorer.Current()
            edgeExplorer = TopExp_Explorer(wire, TopAbs_EDGE)
            edges = []
            diameter = -1
            while edgeExplorer.More():
                shape: TopoDS_Shape = edgeExplorer.Current()
                edge: TopoDS_Edge = cq.Edge(shape).wrapped
                edges.append(edge)
                edgeExplorer.Next()
                curveAdaptor = BRepAdaptor_Curve(edge)
                isCircle = curveAdaptor.GetType() == GeomAbs_Circle
                if isCircle:
                    diameter = curveAdaptor.Circle().Radius() * 2
            if len(edges) == 1 and isCircle:
                isCircleWire = True
            wires.append({"wire": wire, "edges": edges, "isCircle": isCircle, "diameter": diameter})
            explorer.Next()
        
        # find the wires with the most edges, those are the outline wires
        # TODO this won't work for all shapes, better approach would be to find the wires that
        # enclose the most area
        wires.sort(key=lambda wire: len(wire["edges"]), reverse=True)
        outline_wires = wires[:2]

        outline_faces: list[cq.Face] = []
        for wire in outline_wires:
            outline_face = cq.Face.makeFromWires(cq.Wire(wire["wire"]))
            outline_faces.append(outline_face)
        # get distance between the two faces
        outline_distance = outline_faces[1].Center().z - outline_faces[0].Center().z
        # offset the first face and extrude it until the second face
        outline_worplane = cq.Workplane(outline_faces[0])
        outline_extrusion = outline_worplane.wires().toPending().offset2D(board_tolerance_xy, kind="intersection").extrude(outline_distance + board_tolerance_z)

        # find all wires with a diameter of fixation_hole_diameter
        fixation_hole_wires = []
        for wire in wires:
            if wire["isCircle"] and wire["diameter"] == fixation_hole_diameter:
                fixation_hole_wires.append(wire)
        # create a new circle at the same position with a smaller diameter and cut it out from the outline extrusion
        for wire in fixation_hole_wires:
            edge: TopoDS_Edge = wire["edges"][0]
            curveAdaptor = BRepAdaptor_Curve(edge)
            circle_center = curveAdaptor.Circle().Location()
            radius = curveAdaptor.Circle().Radius()
            outline_extrusion = outline_extrusion.moveTo(circle_center.X(), circle_center.Y()).circle(radius - hole_tolerance).cutThruAll()
        parts_boxes[i] = outline_extrusion
    else:
        parts_boxes[i] = parts_boxes[i].union(parts_boxes[i].faces("<Z").shell(part_tolerance, kind="intersection"))

parts_hole_extrusions = []

for part_to_extrude in parts_to_extrude_for_case_bottom:
    part_name = part_to_extrude["name"]
    extrude_dir = part_to_extrude["direction"]
    is_hole_extrusion = part_to_extrude["length"] is HOLE
    extrude_len = case_hole_extrusion_size if is_hole_extrusion else part_to_extrude["length"]
    part_indices = part_indices_of(part_name)
    for part_index in part_indices:
        extrusion = extrude_part_faces(extrude_dir, parts_boxes[part_index], extrude_len)
        if "min_width" in part_to_extrude:
            extrusion = extrude_part_width(extrusion, part_to_extrude["min_width"], extrude_dir)
        if "min_height" in part_to_extrude:
            extrusion = extrude_part_height(extrusion, part_to_extrude["min_height"], extrude_dir)
        if "offset_x" in part_to_extrude:
            extrusion = extrusion.translate((part_to_extrude["offset_x"], 0, 0))
        if "offset_y" in part_to_extrude:
            extrusion = extrusion.translate((0, part_to_extrude["offset_y"], 0))
        if "offset_z" in part_to_extrude:
            extrusion = extrusion.translate((0, 0, part_to_extrude["offset_z"]))
        if is_hole_extrusion:
            parts_hole_extrusions.append(extrusion)
        else:
            parts_boxes[part_index] = parts_boxes[part_index].union(extrusion)

# combine all parts into one object
part_union = cq.Workplane("XY")
for part in parts_boxes:
    part_union = part_union.union(part)
part_union = part_union.union(battery_springs)

###----------------- Case -----------------###
# get bounding box of all parts
part_union_bounding_box = part_union.val().BoundingBox()
part_union_center = part_union.val().CenterOfBoundBox()
part_union_box = cq.Workplane("XY").box(part_union_bounding_box.xlen, case_height, part_union_bounding_box.zlen).translate((part_union_center.x, part_union_center.y, part_union_center.z))
part_union_box = part_union_box.translate((0, part_union_bounding_box.ylen / 2 - case_height/2, 0))
part_union_shell = part_union_box.faces("<Z").shell(minimum_wall_thickness, kind="intersection")

part_union_shell = part_union_shell.union(extrude_part_faces("<Z", part_union_shell, 8, faces_selector=">Z[-2]"))

# cut out holes and parts
part_union_shell = part_union_shell.cut(part_union)
for part_hole_extrusion in parts_hole_extrusions:
    part_union_shell = part_union_shell.cut(part_hole_extrusion)

# TODO use holes to fixate the case

###----------------- Preview -----------------###
# for part_name, bounding_box_part in zip(part_names, part_bounding_boxes):
#     show_object(bounding_box_part, name=part_name)
# show_object(battery_springs, name="battery_springs")
show_object(board, name="board")
# show_object(parts, name="parts")
# show_object(part_union, name="part_union")
show_object(part_union_shell, name="case_bottom")

###----------------- Export -----------------###
cq.Assembly(part_union_shell).save(filename)
