import math
from dataclasses import dataclass
import json
import os
from typing import List
import cadquery as cq
import logging
from cq_part import Part, PartList

path = os.path.dirname(os.path.realpath(__file__))


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
    sizex: float
    sizey: float
    sizez: float


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


def load_part_data(parts_directory: str):
    json_path = os.path.join(path, parts_directory, "parts.json")
    logging.info(f"Loading part data from {json_path}")
    with open(json_path) as f:
        part_data: List[PartDetails] = [
            PartDetails(**item, abs_file_path="") for item in json.load(f)
        ]
    for part in part_data:
        part.abs_file_path = os.path.join(path, parts_directory, part.file)
    return part_data


def load_parts(exclude: List[str] = [], parts_directory="parts"):
    part_data = load_part_data(parts_directory)
    cq_objects: List[cq.Workplane] = []
    bounding_boxes: List[cq.Workplane] = []
    names: List[str] = []
    parts: List[Part] = []

    for part_details in part_data:
        logging.debug(f"Loading part {part_details.name}")
        if any(part_exclude in part_details.name for part_exclude in exclude):
            continue
        names.append(part_details.name)
        part_step = cq.importers.importStep(part_details.abs_file_path)
        cq_objects.append(part_step)
        bounding_box = part_step.val().BoundingBox()
        bounding_box_part = (
            cq.Workplane("XY")
            .box(part_details.sizex, part_details.sizey, part_details.sizez)
            .translate((part_details.posx, part_details.posy, part_details.posz))
        )
        bounding_boxes.append(bounding_box_part)
        parts.append(
            Part(part_details.name, bounding_box, bounding_box_part, part_step)
        )
    logging.info(f"Loaded parts: {names}")
    return PartList(parts)
