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