import math
from dataclasses import dataclass
import json
import os
from typing import List
import cadquery as cq

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


@dataclass
class Part:
    name: str
    file: str
    abs_file_path: str
    posx: float
    posy: float
    posz: float
    rotx: float
    roty: float
    rotz: float
    rotw: float

def load_part_data(parts_directory="parts"):
    with open(path + "/" + parts_directory + "/parts.json") as f:
        part_data: List[Part] = [Part(**item, abs_file_path="") for item in json.load(f)]
    for part in part_data:
        part.abs_file_path = path + "/" + parts_directory + "/" + part.file
    return part_data

def import_part_step(part: Part):
    """
    Import a part from a STEP file and apply the part's position and rotation.
    :param part: Part object
    :return: cadquery.Workplane object
    """
    part_step = cq.importers.importStep(part.abs_file_path)
    axis_angle_rotation = quaternion_to_axis_angle(part.rotx, part.roty, part.rotz, part.rotw)
    if axis_angle_rotation[2] != 0:
        part_step = part_step.rotate(axisStartPoint=axis_angle_rotation[0], axisEndPoint=axis_angle_rotation[1], angleDegrees=axis_angle_rotation[2])
    return part_step.translate((part.posx, part.posy, part.posz))

def load_parts(parts_exclude: List[str] = []):
    part_data = load_part_data()
    parts: List[cq.Workplane] = []
    part_bounding_boxes: List[cq.Workplane] = []
    part_names: List[str] = []

    for part in part_data:
        if any(part_exclude in part.name for part_exclude in parts_exclude):
            continue
        part_names.append(part.name)
        part_step = import_part_step(part)
        part_step_center = part_step.val().CenterOfBoundBox()
        parts.append(part_step)
        bounding_box = part_step.val().BoundingBox()
        bounding_box_part = cq.Workplane("XY").box(bounding_box.xlen, bounding_box.ylen, bounding_box.zlen).translate((part_step_center.x, part_step_center.y, part_step_center.z))
        part_bounding_boxes.append(bounding_box_part)

    return parts, part_bounding_boxes, part_names

def extrude_part(dir: cq.Selector, part: cq.Workplane, length: int):
    pending_wires = part.faces(dir).wires().toPending()
    if dir == ">Z":
        direction = cq.Vector(0, 0, 1)
    if dir == "<Z":
        direction = cq.Vector(0, 0, -1)
    if dir == ">X":
        direction = cq.Vector(1, 0, 0)
    if dir == "<X":
        direction = cq.Vector(-1, 0, 0)
    if dir == ">Y":
        direction = cq.Vector(0, 1, 0)
    if dir == "<Y":
        direction = cq.Vector(0, -1, 0)
    pending_wires.plane.zDir = direction
    extruded_part = pending_wires.extrude(length)
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
        part = part.union(extrude_part(f">{direction}", part, extrusion_length/2))
        part = part.union(extrude_part(f"<{direction}", part, extrusion_length/2))
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
        part = part.union(extrude_part(f">{direction}", part, extrusion_length/2))
        part = part.union(extrude_part(f"<{direction}", part, extrusion_length/2))
    return part