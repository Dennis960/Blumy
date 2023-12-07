from part_loader import load_parts
from components import battery_springs
import cadquery as cq
from board_converter import convert
from typing import List
from geometry import Vector  # TODO replace all Vector with cq.Vector
from cq_part import PartSetting, HOLE_TYPE, DIMENSION_TYPE, ALIGNMENT, Part, PCB_PART_NAME
from bottom_case import BottomCase
from compartment_door import CompartmentDoor, CompartmentDoorSettings
from battery_holder import BatteryHolderSettings, BatteryHolder
from dataclasses import dataclass, field

import logging

logging.basicConfig(level=logging.INFO)


@dataclass
class CasemakerSettings:
    kicad_pcb_path: str = "ESPlant-Board/ESPlant-Board.kicad_pcb"
    cache_directory: str = "parts"

    case_wall_thickness = 1.5
    case_floor_max_thickness = 8 + 1.6

    # Optional: Specify the max size and offset of the case (for letting a part of the pcb stick out)
    bottom_case_dimension = (DIMENSION_TYPE.AUTO, 62, 12)
    bottom_case_offset = (0, ALIGNMENT.POSITIVE, ALIGNMENT.POSITIVE)

    should_use_fixation_holes = True
    fixation_hole_tolerance = 0.1
    fixation_hole_diameter = 2.0

    pcb_tolerance = Vector(
        1.5, 1.5, 0.5
    )  # having different tolerances for x and y is not supported
    part_tolerance = 1
    parts_to_ignore_in_case_generation = ["PinHeader"]
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

    list_of_additional_parts: List[Part] = field(default_factory=lambda: [
        Part(
            "Battery Springs",
            battery_springs.val().BoundingBox(),
            battery_springs,
            battery_springs,
        ),
    ])


class Casemaker:
    def __init__(self, settings: CasemakerSettings = CasemakerSettings(), compartment_door_settings: CompartmentDoorSettings = None, battery_holder_settings: BatteryHolderSettings = BatteryHolderSettings()):
        self.settings = settings
        self.compartment_door_settings = compartment_door_settings
        self.battery_holder_settings = battery_holder_settings
        s = self.settings
        
        # TODO extract all code below to separate callable functions for possible performance improvements by using caches
        self.original_board = self.load_original_board()

        ### ----------------- Board + Components (Boxes) -----------------###
        part_list = load_parts(
            exclude=s.parts_to_ignore_in_case_generation, parts_directory=s.cache_directory)
        for additional_part in s.list_of_additional_parts:
            part_list.add_part(additional_part)
        part_list.apply_part_tolerances(s.part_tolerance)
        part_list.apply_pcb_tolerance(
            s.pcb_tolerance, s.should_use_fixation_holes, s.fixation_hole_diameter, s.fixation_hole_tolerance
        )
        part_list.apply_settings(s.part_settings)

        ### ----------------- Case -----------------###
        # TODO create a BottomCaseSettings dataclass and move the bottom case settings there, then extract the settings to CasemakerSettings
        self.bottom_case = BottomCase(part_list)
        self.bottom_case.override_dimension(s.bottom_case_dimension)
        self.bottom_case.override_offset(s.bottom_case_offset)
        self.bottom_case_cq_object = self.bottom_case.generate_case(
            s.case_wall_thickness, s.case_floor_max_thickness
        )

        bottom_case_open_face_bb = self.bottom_case_cq_object.faces(
            "<Z").val().BoundingBox()

        # TODO extract compartment door settings to CasemakerSettings, compartment door should be optional and individually configurable
        if compartment_door_settings is None:
            compartment_door_settings = CompartmentDoorSettings(
                compartment_door_dimensions=(
                    bottom_case_open_face_bb.xlen - 2 * s.case_wall_thickness, bottom_case_open_face_bb.ylen - 2 * s.case_wall_thickness, 1.5),
                tab_spacing_factor=0.8
            )
        self.compartment_door = CompartmentDoor(compartment_door_settings)

        # flip the compartment door
        self.compartment_door.flip()
        # move the compartment door to the top of the case
        self.compartment_door.move(
            bottom_case_open_face_bb.center.x,
            bottom_case_open_face_bb.center.y,
            bottom_case_open_face_bb.center.z + 0.5 * s.case_wall_thickness,
        )

        self.bottom_case_cq_object = self.bottom_case_cq_object.union(self.compartment_door.frame).cut(
            self.compartment_door.door_with_tolerance).cut(self.bottom_case.get_cuts())
        self.compartment_door.door = self.compartment_door.door.cut(
            self.original_board)

        ### ----------------- Battery Holder -----------------###
        # TODO refactoring needed, and battery holder should be optional and individually configurable
        self.battery_holder = BatteryHolder(self.battery_holder_settings)
        self.battery_holder.battery_holder = (self.battery_holder.battery_holder
                                              .rotate((0, 0, 0), (0, 1, 0), 180)
                                              .translate((
                                                  bottom_case_open_face_bb.center.x,
                                                  bottom_case_open_face_bb.center.y + 1.5,
                                                  bottom_case_open_face_bb.zmin))
                                              )
        self.battery_holder.battery_holder = self.battery_holder.battery_holder.cut(
            self.original_board)

        self.case_preview = (self.bottom_case_cq_object
                             .union(self.original_board)
                             .union(self.bottom_case_cq_object)
                             .union(self.compartment_door.door)
                             .union(self.battery_holder.battery_holder))

    def load_original_board(self) -> cq.Workplane:
        # Converts the pcb board and generates the parts.json file if it doesn't exist yet
        board_step_path = convert(
            self.settings.kicad_pcb_path, self.settings.cache_directory)
        original_board = cq.importers.importStep(board_step_path)
        for additional_part in self.settings.list_of_additional_parts:
            original_board = original_board.union(
                additional_part.cq_object)
        return original_board


if __name__ == "__main__":
    from ocp_vscode import show_all

    casemaker = Casemaker(CasemakerSettings(), None,
                          BatteryHolderSettings(front_wall_thickness=2.5,
                                                back_wall_thickness=1.5,
                                                insertable_springs_thickness=1,
                                                polartiy_text_spacing=0.3,
                                                battery_length_tolerance=4))
    show_all({
        "board": casemaker.original_board,
        "case_bottom": casemaker.bottom_case_cq_object,
        "compartment_door": casemaker.compartment_door.door,
        "battery_holder": casemaker.battery_holder.battery_holder,
    })
