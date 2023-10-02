import cadquery as cq
from ocp_vscode import *
import os

path = os.path.dirname(os.path.abspath(__file__))

###----------------- General tolerances -----------------###
minimum_width = 0.5
minimum_wall_thickness = 1.5
closure_tolerance = 0.5
hole_tolerance = 0.1
board_tolerance_xy = 1.5
board_tolerance_z = 0.5
battery_spring_tolerance = 1

###----------------- Board dimensions -----------------###
board_thickness = 1.6
board_width = 22
board_height = 55
board_bottom_radius = 5
board_top_radius = 0.5

# battery_spring
battery_spring_hole_size = (3.3, 0.5) # oval
battery_spring_hole_padding = (5.5, 5.9) # padding from bottom left corner of board
battery_spring_thickness = battery_spring_hole_size[1] + battery_spring_tolerance
battery_spring_contact_size = 11
battery_spring_leg_size = (battery_spring_hole_size[0] + battery_spring_tolerance, battery_spring_thickness, 8)
battery_spring_contact_size = (battery_spring_contact_size, battery_spring_thickness, battery_spring_contact_size)
battery_spring_spring_length = 8
battery_spring_spring_width = 7

###----------------- Workplanes -----------------###

xy = cq.Workplane("XY")

# battery spring holes
battery_spring_holes = xy.moveTo(-board_width/2 + battery_spring_hole_padding[0], -board_height + battery_spring_hole_padding[1]).rect(battery_spring_hole_size[0], battery_spring_hole_size[1]).mirrorY().extrude(100, both=True)

# board shell
# board_shell = board.faces("<Z or >Z").shell(board_tolerance_xy, kind="intersection")
# #TODO
# board_shell = board.faces("<Z").wires().toPending().extrude(-board_tolerance_z)

# board = board.cut(holes)
# board_shell = board_shell.cut(holes)

# battery spring leg
battery_spring_leg = xy.moveTo(-board_width/2 + battery_spring_hole_padding[0], -board_height + battery_spring_hole_padding[1]).rect(battery_spring_leg_size[0], battery_spring_leg_size[1]).extrude(battery_spring_leg_size[2])

# battery spring contact
battery_spring_contact = xy.moveTo(-board_width/2 + battery_spring_hole_padding[0], -board_height + battery_spring_hole_padding[1]).rect(battery_spring_contact_size[0], battery_spring_contact_size[1]).extrude(-battery_spring_contact_size[2])

# battery spring spring
battery_spring_springs = battery_spring_contact.faces(">Y").workplane(centerOption="CenterOfBoundBox").rect(battery_spring_spring_width, battery_spring_contact_size[0]).extrude(battery_spring_spring_length)

battery_springs = battery_spring_leg.union(battery_spring_contact).union(battery_spring_springs)
battery_springs = battery_springs.union(battery_springs.mirror(mirrorPlane="YZ"))

###----------------- Case bottom -----------------###


###----------------- Case top -----------------###


###----------------- Case over -----------------###

import json
from typing import List
from utils import convert_rotation, Part


# Load parts/parts.json
with open(path + "/parts/parts.json") as f:
    part_data: List[Part] = [Part(**item) for item in json.load(f)]

parts = []
part_names = []

for part in part_data:
    part_step = cq.importers.importStep(path + "/parts/" + part.file)
    converted_rotation = convert_rotation(part.rotx, part.roty, part.rotz, part.rotw)
    if converted_rotation["angleDegrees"] != 0:
        part_step = part_step.rotate(converted_rotation["axisStartPoint"], converted_rotation["axisEndPoint"], converted_rotation["angleDegrees"])
    part_step = part_step.translate((part.posx, part.posy, part.posz))
    parts.append(part_step)
    part_names.append(part.name)

print(part_names)
show([*parts, battery_springs], names=part_names)
###----------------- Preview -----------------###
# show_object(battery_springs, name="battery_springs")
# show_object(board_shell, name="board_shell")

###----------------- Export -----------------###
# cq.Assembly(board).save("board.step")
