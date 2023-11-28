from dataclasses import dataclass
import re
from typing import List
import cadquery as cq
from enum import Enum
from utils import extrude_part_faces, extrude_part_width, extrude_part_height

case_hole_extrusion_size = 1000

class HOLE_TYPE(Enum):
    HOLE = "HOLE"
class DIMENSION_TYPE(Enum):
    AUTO = "AUTO"
class ALIGNMENT(Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"

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

@dataclass
class Part:
    name: str
    bound_box: cq.BoundBox
    cq_bounding_box: cq.Workplane
    cq_object: cq.Workplane
    hole_cq_object: cq.Workplane = None

    def apply_setting(self, part_setting: PartSetting):
        is_hole_extrusion = part_setting.length is HOLE_TYPE.HOLE
        extrude_len = case_hole_extrusion_size if is_hole_extrusion else part_setting.length
        extrusion = extrude_part_faces(part_setting.direction, self.cq_bounding_box, extrude_len)
        if part_setting.width is not DIMENSION_TYPE.AUTO:
            extrusion = extrude_part_width(extrusion, part_setting.width, part_setting.direction)
        if part_setting.height is not DIMENSION_TYPE.AUTO:
            extrusion = extrude_part_height(extrusion, part_setting.height, part_setting.direction)
        extrusion = extrusion.translate((part_setting.offset_x, part_setting.offset_y, part_setting.offset_z))
        if is_hole_extrusion:
            self.hole_cq_object = self.cq_bounding_box.union(extrusion)
        else:
            self.cq_bounding_box = self.cq_bounding_box.union(extrusion)

                
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
