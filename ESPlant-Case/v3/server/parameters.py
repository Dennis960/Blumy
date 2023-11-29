from typing import List, Tuple

class PartSetting:
    def __init__(
        self,
        pattern: str,
        position: str,
        hole_type: str,
        width: float = None,
        height: float = None,
        offset_y: float = None
    ):
        self.pattern = pattern
        self.position = position
        self.hole_type = hole_type
        self.width = width
        self.height = height
        self.offset_y = offset_y

class Part:
    def __init__(
        self,
        name: str,
        type: str,
        width: float,
        height: float,
        thickness: float,
        position: Tuple[float, float, float]
    ):
        self.name = name
        self.type = type
        self.width = width
        self.height = height
        self.thickness = thickness
        self.position = position

class CaseConfiguration:
    def __init__(
        self,
        case_wall_thickness: float,
        case_floor_height: float,
        hole_fit_tolerance: float,
        pcb_tolerance: Tuple[float, float, float],
        part_tolerance: float,
        should_use_fixation_holes: bool,
        fixation_hole_diameter: float,
        parts_to_ignore_in_case_generation: List[str],
        part_settings: List[PartSetting],
        bottom_case_dimension: Tuple[str, float, str],
        bottom_case_offset: Tuple[int, str, int],
        list_of_additional_parts: List[Part]
    ):
        self.case_wall_thickness = case_wall_thickness
        self.case_floor_height = case_floor_height
        self.hole_fit_tolerance = hole_fit_tolerance
        self.pcb_tolerance = pcb_tolerance
        self.part_tolerance = part_tolerance
        self.should_use_fixation_holes = should_use_fixation_holes
        self.fixation_hole_diameter = fixation_hole_diameter
        self.parts_to_ignore_in_case_generation = parts_to_ignore_in_case_generation
        self.part_settings = part_settings
        self.bottom_case_dimension = bottom_case_dimension
        self.bottom_case_offset = bottom_case_offset
        self.list_of_additional_parts = list_of_additional_parts
