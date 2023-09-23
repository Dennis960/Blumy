import cadquery as cq
from ocp_vscode import *
import math

###----------------- General tolerances -----------------###
minimum_width = 0.5
minimum_wall_thickness = 1.5
closure_tolerance = 0.5
hole_tolerance = 0.1
board_tolerance = 1.5

###----------------- Board dimensions -----------------###
board_thickness = 1.6
board_width = 22
board_height = 55
board_bottom_radius = 5
board_top_radius = 0.5

# hanger
board_hanger_width = 4
board_hanger_height = 2

# holes
board_hole_size = 2
board_bottom_hole_padding = (3, 4) # padding from bottom left corner of board
battery_spring_hole_size = (3.3, 0.5) # oval
battery_spring_hole_padding = (5.5, 5.9) # padding from bottom left corner of board

# sensor
sensor_length = 60
sensor_tip_length = 10
sensor_tip_radius = 22.565
sensor_width = 12

###----------------- Workplanes -----------------###

xy = cq.Workplane("XY")

###----------------- Board (PCB) construction -----------------###
# board outline
board = xy.line(-board_width/2, 0).line(0, -board_height).line(board_width/2, 0).mirrorY().extrude(board_thickness)
# board hanger
board = board.moveTo(board_width/2, 0).rect(-board_hanger_width, board_hanger_height, centered=False).extrude(board_thickness)
# board fillets
board = board.faces("<Y").edges("|Z").fillet(board_bottom_radius)

# sensor outline
board = board.union(xy.moveTo(0, -board_height).line(-sensor_width/2, 0).line(0, -sensor_length+sensor_tip_length).radiusArc([0, -sensor_length - board_height], -sensor_tip_radius).mirrorY().extrude(board_thickness))

# board holes
board_holes = xy.moveTo(board_width/2 - board_hanger_width/2, 0).moveTo(board_width/2 - board_hanger_width/2, 0).circle(1).extrude(100, both=True)
board_holes = board_holes.moveTo(-board_width/2 + board_bottom_hole_padding[0], -board_height + board_bottom_hole_padding[1]).circle(board_hole_size/2).mirrorY().extrude(100, both=True)

battery_spring_holes = xy.moveTo(-board_width/2 + battery_spring_hole_padding[0], -board_height + battery_spring_hole_padding[1]).rect(battery_spring_hole_size[0], battery_spring_hole_size[1], centered=False).extrude(100, both=True)

holes = board_holes.union(battery_spring_holes)

# board shell
board_shell = board.faces(">Z").shell(board_tolerance, kind="intersection")

board = board.cut(holes)
board_shell = board_shell.cut(holes)

###----------------- Board components -----------------###

def create_rect_component(position: tuple[float, float], size: tuple[float, float, float]):
    return xy.rect(size[0], size[1]).extrude(size[2]).translate((size[0]/2 + position[0] - board_width/2, -size[1]/2 - position[1], board_thickness))

esp = create_rect_component((3.2, -5.2), (13.2, 16.6, 2.4))

###----------------- Case bottom -----------------###


###----------------- Case top -----------------###


###----------------- Case over -----------------###


###----------------- Preview -----------------###
show_object(board, name="board")
show_object(esp, name="esp")
show_object(board_shell, name="board_shell")

###----------------- Export -----------------###
# cq.Assembly(board).save("board.step")
