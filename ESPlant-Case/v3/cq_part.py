from dataclasses import dataclass
import re
from typing import List, Literal
import cadquery as cq
from enum import Enum
from utils import extrude_part_faces, extrude_part_width, extrude_part_height
from pcb import make_offset_shape

case_hole_extrusion_size = 1000
PCB_PART_NAME = "PCB"


class HOLE_TYPE(Enum):
    HOLE = "HOLE"


class DIMENSION_TYPE(Enum):
    AUTO = "AUTO"


class ALIGNMENT(Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"


@dataclass
class PartSetting:
    name_regex: str
    top_direction: Literal[">X", ">Y", ">Z", "<X", "<Y", "<Z"]
    length: float | HOLE_TYPE = None
    offset_x: float = 0
    offset_y: float = 0
    offset_z: float = 0
    width: float | DIMENSION_TYPE = DIMENSION_TYPE.AUTO
    height: float | DIMENSION_TYPE = DIMENSION_TYPE.AUTO


@dataclass
class Part:
    name: str
    bound_box: cq.BoundBox
    cq_bounding_box: cq.Workplane
    cq_object: cq.Workplane
    hole_cq_object: cq.Workplane = None

    def apply_setting(self, part_setting: PartSetting):
        is_hole_extrusion = part_setting.length is HOLE_TYPE.HOLE
        extrude_len = (
            case_hole_extrusion_size if is_hole_extrusion else part_setting.length
        )
        extrusion = extrude_part_faces(
            self.cq_bounding_box, part_setting.top_direction, extrude_len
        )
        if part_setting.width is not DIMENSION_TYPE.AUTO:
            extrusion = extrude_part_width(
                extrusion, part_setting.width, part_setting.top_direction
            )
        if part_setting.height is not DIMENSION_TYPE.AUTO:
            extrusion = extrude_part_height(
                extrusion, part_setting.height, part_setting.top_direction
            )
        extrusion = extrusion.translate(
            (part_setting.offset_x, part_setting.offset_y, part_setting.offset_z)
        )
        if is_hole_extrusion:
            self.hole_cq_object = self.cq_bounding_box.union(extrusion)
        else:
            self.cq_bounding_box = self.cq_bounding_box.union(extrusion)


class PartList:
    def __init__(self, parts: List[Part]):
        self.parts = parts

    def add_part(self, part: Part):
        self.parts.append(part)

    def find_all_by_name_regex(self, regex: str):
        """
        Get the indices of all parts that include the given regular expression.
        """
        return [part for part in self.parts if re.match(f".*{regex}.*", part.name)]

    def find_all_index_by_name_regex(self, regex: str):
        """
        Get the indices of all parts that include the given regular expression.
        """
        return [
            i
            for i, part_name in enumerate(self.parts)
            if re.match(regex, part_name)
        ]
    
    def find_all_pcbs(self):
        pcbs = self.find_all_by_name_regex(PCB_PART_NAME)
        if len(pcbs) == 0:
            raise Exception(f"Could not find any part with name {PCB_PART_NAME}")
        return pcbs

    def apply_part_tolerances(self, part_tolerance: float):
        for part in self.parts:
            if PCB_PART_NAME in part.name:
                continue
            else:
                part.cq_bounding_box = part.cq_bounding_box.union(
                    part.cq_bounding_box.faces("<Z").shell(
                        part_tolerance, kind="intersection"
                    )
                )

    def apply_pcb_tolerance(
        self,
        board_tolerance: float,
        use_fixation_holes: bool,
        fixation_hole_diameter: float,
        hole_tolerance: float,
    ):
        pcbs = self.find_all_pcbs()
        for pcb in pcbs:
            pcb.cq_bounding_box = make_offset_shape(
                pcb.cq_object,
                board_tolerance,
                use_fixation_holes,
                fixation_hole_diameter,
                hole_tolerance,
            )

    def apply_settings(self, part_settings: List[PartSetting]):
        for part_setting in part_settings:
            parts = self.find_all_by_name_regex(part_setting.name_regex)
            for part in parts:
                part.apply_setting(part_setting)

    def get_bounding_box_union(self):
        # combine all parts into one object
        part_union = cq.Workplane("XY")
        for part in self.parts:
            part_union = part_union.union(part.cq_bounding_box)
        return part_union
