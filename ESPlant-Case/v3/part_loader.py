import math
from dataclasses import dataclass
import json
import os
from typing import List
import cadquery as cq
import logging
import re

path = os.path.dirname(os.path.realpath(__file__))

@dataclass
class Part:
    name: str
    bound_box: cq.BoundBox
    cq_bounding_box: cq.Workplane
    cq_object: cq.Workplane

class PartList:
    def __init__(self, parts: List[Part]):
        self.parts = parts

    def find_all_by_name_regex(self, regex: str):
        """
        Get the indices of all parts that include the given regular expression.
        """
        return [part for part in self.parts if re.match(f".*{regex}.*", part.name)]
    
    def find_all_index_by_name_regex(self, regex: str):
        """
        Get the indices of all parts that include the given regular expression.
        """
        return [i for i, part_name in enumerate(self.parts) if re.match(f".*{regex}.*", part_name)]

@dataclass
class PartDetails:
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


def quaternion_to_axis_angle(x, y, z, w):
    """
    Convert quaternion to axis-angle representation
    :param x: x component of quaternion
    :param y: y component of quaternion
    :param z: z component of quaternion
    :param w: w component of quaternion
    :return: axis-angle representation of quaternion
    """
    logging.debug(f"Converting quaternion {x}, {y}, {z}, {w} to axis-angle")
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

def load_part_data(parts_directory="parts"):
    json_path = path + '/' + parts_directory + '/parts.json'
    logging.info(f"Loading part data from {json_path}")
    with open(json_path) as f:
        part_data: List[PartDetails] = [PartDetails(**item, abs_file_path="") for item in json.load(f)]
    for part in part_data:
        part.abs_file_path = path + "/" + parts_directory + "/" + part.file
    return part_data

def import_part_step(part: PartDetails):
    """
    Import a part from a STEP file and apply the part's position and rotation.
    :param part: Part object
    :return: cadquery.Workplane object
    """
    logging.debug(f"Importing part {part.name} from {part.abs_file_path} into cadquery")
    part_step = cq.importers.importStep(part.abs_file_path)
    axis_angle_rotation = quaternion_to_axis_angle(part.rotx, part.roty, part.rotz, part.rotw)
    if axis_angle_rotation[2] != 0:
        part_step = part_step.rotate(axisStartPoint=axis_angle_rotation[0], axisEndPoint=axis_angle_rotation[1], angleDegrees=axis_angle_rotation[2])
    return part_step.translate((part.posx, part.posy, part.posz))

def load_parts(exclude: List[str] = []):
    part_data = load_part_data()
    cq_objects: List[cq.Workplane] = []
    bounding_boxes: List[cq.Workplane] = []
    names: List[str] = []
    parts: List[Part] = []

    for part_details in part_data:
        logging.debug(f"Loading part {part_details.name}")
        if any(part_exclude in part_details.name for part_exclude in exclude):
            continue
        names.append(part_details.name)
        part_step = import_part_step(part_details)
        part_step_center = part_step.val().CenterOfBoundBox()
        cq_objects.append(part_step)
        bounding_box = part_step.val().BoundingBox()
        bounding_box_part = cq.Workplane("XY").box(bounding_box.xlen, bounding_box.ylen, bounding_box.zlen).translate((part_step_center.x, part_step_center.y, part_step_center.z))
        bounding_boxes.append(bounding_box_part)
        parts.append(Part(part_details.name, bounding_box, bounding_box_part, part_step))
    logging.info(f"Loaded parts: {names}")
    return PartList(parts)
