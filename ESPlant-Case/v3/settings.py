from dataclasses import dataclass, field
from enum import Enum
from typing import List, Literal, NewType
import cadquery as cq
from OCP.TopoDS import TopoDS_Shape
from components import battery_springs


case_hole_extrusion_size = 1000
PCB_PART_NAME = "PCB"


class TextDirection(Enum):
    CUT = 0
    EXTRUDE = 1


class HOLE_TYPE(Enum):
    HOLE = "HOLE"


class DIMENSION_TYPE(Enum):
    AUTO = "AUTO"


class ALIGNMENT(Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"


class SIDE(Enum):
    TOP = ">Z"
    BOTTOM = "<Z"
    LEFT = "<X"
    RIGHT = ">X"
    FRONT = ">Y"
    BACK = "<Y"


Dimension = NewType(
    "BottomCaseDimension",
    tuple[float | DIMENSION_TYPE, float |
          DIMENSION_TYPE, float | DIMENSION_TYPE],
)
Offset = NewType(
    "BottomCaseOffset", tuple[float | ALIGNMENT,
                              float | ALIGNMENT, float | ALIGNMENT]
)


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
class CaseSettings:
    case_wall_thickness = 1.5
    case_floor_max_thickness = 8 + 1.6
    # Optional: Specify the max size and offset of the case (for letting a part of the pcb stick out)
    bottom_case_dimension = (DIMENSION_TYPE.AUTO, 62, 12)
    bottom_case_offset = (0, ALIGNMENT.POSITIVE, ALIGNMENT.POSITIVE)


@dataclass
class BoardSettings:
    should_use_fixation_holes = True
    fixation_hole_tolerance = 0.1
    fixation_hole_diameter = 2.0
    fixation_hole_bigger_diameter = 5.0

    pcb_tolerance = cq.Vector(
        1.5, 1.5, 0.5
    )  # having different tolerances for x and y is not supported
    part_tolerance = 1
    part_settings: List[PartSetting] = field(default_factory=lambda: [
        PartSetting(".*", ">Z", 0.5),
        PartSetting(".*", "<Z", 0.5),
        PartSetting(".*MICRO-USB.*", ">X",
                    HOLE_TYPE.HOLE, width=11, height=6.5),
        PartSetting(".*SW-SMD_4P.*", ">Z", HOLE_TYPE.HOLE),
        PartSetting(".*SW-SMD_MK.*", ">Z", HOLE_TYPE.HOLE,
                    offset_y=-2, height=10),
        PartSetting(".*LED.*", ">Z", HOLE_TYPE.HOLE),
        PartSetting(".*ALS-PT19.*", ">Z", HOLE_TYPE.HOLE),
        PartSetting(f".*{PCB_PART_NAME}.*", "<Z", HOLE_TYPE.HOLE),
        PartSetting(".*ESP.*", "<Z", HOLE_TYPE.HOLE),
        PartSetting(".*ESP.*", ">Z", 2),
    ])
    pcb_thickness = 1.6

    additional_parts_dict: dict[str, TopoDS_Shape] = field(default_factory=lambda: {
        "Battery Springs": battery_springs.val().wrapped
    })


@dataclass
class CompartmentDoorSettings:
    """
    The settings for the compartment door
    :param compartment_door_dimensions: The dimensions of the compartment door, meaning the width, height and thickness including the fitting arm(s)
    :param fitting_arm_thickness: The thickness of the fitting arm. Thicker means thicker snap joints and more tension
    :param fitting_arm_height: How deep the fitting arm goes into the case. Higher (meaning deeper) means more suspension
    :param fitting_arm_width: How wide the fitting arm is. It is not recommended to have this value be greater than the width of the compartment door
    :param fitting_arm_distance_factor: TODO
    :param tab_dimension: The dimensions of the tabs, meaning the width and height. Half of the height will be below the compartment door and the other half will stick out
                          The thickness of the tabs is the same as the thickness of the compartment door
    :param recessed_edge_width: The width of the recessed edge. This is the amount of extra space on which the compartment door will be placed to not have it stick out and not have it fall in
    :param snap_joint_face_selectors: The face selectors of the faces of the compartment door where the snap joints should be placed. Uses the cadquery face selectors (eg. +Y means the face on the positive y axis)
                                      Multiple face selectors can be used by passing a list of face selectors
    :param tabs_face_selector: The face selector of the face of the compartment door where the tabs should be placed. Only one face can be selected. Uses the cadquery face selectors (eg. >Y means the face on the positive y axis)
                               Should be placed on the opposite side of the snap joints

    :param tab_tolerance: The tolerance for the tabs. This is the amount of extra space where the tabs will be inserted
    :param fitting_arm_tolerance: The tolerance for the fitting arm. This is the amount of extra space (height and width) where the fitting arm will be inserted
    :param compartment_door_tolerance: The tolerance for the compartment door. This is the amount of extra space where the compartment door will be inserted
    """
    compartment_door_dimensions: cq.Vector = field(
        default_factory=lambda: cq.Vector(50, 60, 1.5))
    fitting_arm_thickness: float = 1.5
    fitting_arm_height: float = 10
    fitting_arm_width: float = 16
    fitting_arm_distance_factor: float = 2
    fitting_arm_angle_offset: float = 0.5
    fitting_arm_frame_thickness: float = 1.5
    tab_dimension: cq.Vector = (2, 3)
    tab_spacing_factor: float = 0.5
    recessed_edge_width: float = 2
    snap_joint_overhang: float = 1
    snap_joint_face_selectors: List[Literal["+Y", "-Y",
                                            "+X", "-X"]] = field(default_factory=lambda: ["+Y"])
    tabs_face_selector: Literal["<Y", ">Y", "<X", ">X"] = "<Y"

    text_size: float = 10
    frame_text_size: float = 5
    text_thickness: float = 0.5
    compartment_door_text: str = ""
    frame_text: str = ""

    tab_tolerance: float = 0.5
    fitting_arm_tolerance: float = 0.5
    compartment_door_tolerance: float = 0.5

    def __post_init__(self):
        self.snap_joint_face_selector = " or ".join(
            self.snap_joint_face_selectors)
        if not type(self.tab_dimension) == cq.Vector:
            self.tab_dimension = cq.Vector(self.tab_dimension)
        if not type(self.compartment_door_dimensions) == cq.Vector:
            self.compartment_door_dimensions = cq.Vector(
                self.compartment_door_dimensions)


@dataclass
class BatteryHolderSettings:
    battery_diameter: float = 10.5
    battery_length: float = 44.5
    number_of_batteries: int = 2

    floor_thickness: float = 1.5

    outer_wall_height: float = 8
    outer_wall_thickness: float = 1.5
    inner_wall_height: float = 5
    inner_wall_thickness: float = 1.5
    front_wall_height: float = 11
    front_wall_thickness: float = 5
    back_wall_height: float = 11
    back_wall_thickness: float = 5

    insertable_springs_thickness: float = 4

    center_text: str = "AAA"
    text_size: float = 5
    text_thickness: float = 0.5

    flip_polarity: bool = False
    polarity_text_direction: TextDirection = TextDirection.CUT
    polartiy_text_spacing: float = 0.4

    battery_diameter_tolerance: float = 1
    battery_length_tolerance: float = 1
