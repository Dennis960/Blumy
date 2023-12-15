import math
import os
import cadquery as cq
from settings import SIDE

path = os.path.dirname(os.path.abspath(__file__))


def quaternion_to_axis_angle(x, y, z, w):
    """
    Convert quaternion to axis-angle representation
    :param x: x component of quaternion
    :param y: y component of quaternion
    :param z: z component of quaternion
    :param w: w component of quaternion
    :return: axis-angle representation of quaternion
    """
    angle = 2 * math.acos(w)
    s = math.sqrt(1 - w * w)
    if s < 0.001:
        x = x
        y = y
        z = z
    else:
        x = x / s
        y = y / s
        z = z / s
    return ((0, 0, 0), (x, y, z), math.degrees(angle))


def extrude_part_faces(
    part: cq.Workplane,
    selector: cq.Selector,
    until: int | cq.Face,
    faces_selector: cq.Selector = None,
):
    if (until == 0):
        return part
    if faces_selector is None:
        faces_selector = selector
    pending_wires = part.faces(faces_selector).wires().toPending()
    if selector == ">Z":
        direction = cq.Vector(0, 0, 1)
    elif selector == "<Z":
        direction = cq.Vector(0, 0, -1)
    elif selector == ">X":
        direction = cq.Vector(1, 0, 0)
    elif selector == "<X":
        direction = cq.Vector(-1, 0, 0)
    elif selector == ">Y":
        direction = cq.Vector(0, 1, 0)
    elif selector == "<Y":
        direction = cq.Vector(0, -1, 0)
    pending_wires.plane.zDir = direction
    extruded_part = pending_wires.extrude(until)
    pending_wires.plane.zDir = cq.Vector(0, 0, 1)
    return extruded_part


def get_width_direction(dir: cq.Selector):
    if dir == ">Z" or dir == "<Z":
        return "X"
    if dir == ">X" or dir == "<X":
        return "Y"
    if dir == ">Y" or dir == "<Y":
        return "X"


def get_height_direction(dir: cq.Selector):
    if dir == ">Z" or dir == "<Z":
        return "Y"
    if dir == ">X" or dir == "<X":
        return "Z"
    if dir == ">Y" or dir == "<Y":
        return "Z"


def extrude_part_width(part: cq.Workplane, min_width: int, dir: cq.Selector):
    direction = get_width_direction(dir)
    bounding_box = part.val().BoundingBox()
    if direction == "X":
        width = bounding_box.xlen
    if direction == "Y":
        width = bounding_box.ylen
    if direction == "Z":
        width = bounding_box.zlen
    if width < min_width:
        extrusion_length = min_width - width
        part = part.union(
            extrude_part_faces(part, f">{direction}", extrusion_length / 2)
        )
        part = part.union(
            extrude_part_faces(part, f"<{direction}", extrusion_length / 2)
        )
    return part


def extrude_part_height(part: cq.Workplane, min_height: int, dir: cq.Selector):
    direction = get_height_direction(dir)
    bounding_box = part.val().BoundingBox()
    if direction == "X":
        height = bounding_box.xlen
    if direction == "Y":
        height = bounding_box.ylen
    if direction == "Z":
        height = bounding_box.zlen
    if height < min_height:
        extrusion_length = min_height - height
        part = part.union(
            extrude_part_faces(part, f">{direction}", extrusion_length / 2)
        )
        part = part.union(
            extrude_part_faces(part, f"<{direction}", extrusion_length / 2)
        )
    return part


def get_rotation_for_side(side: SIDE) -> tuple[cq.Vector, cq.Vector, float]:
    if side is SIDE.BOTTOM:
        return (cq.Vector(0, 0, 0), cq.Vector(0, 1, 0), 180)
    elif side is SIDE.LEFT:
        return (cq.Vector(0, 0, 0), cq.Vector(0, 1, 0), -90)
    elif side is SIDE.RIGHT:
        return (cq.Vector(0, 0, 0), cq.Vector(0, 1, 0), 90)
    elif side is SIDE.TOP:
        pass
    elif side is SIDE.FRONT:
        return (cq.Vector(0, 0, 0), cq.Vector(1, 0, 0), -90)
    elif side is SIDE.BACK:
        return (cq.Vector(0, 0, 0), cq.Vector(1, 0, 0), 90)
