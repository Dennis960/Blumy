from board_converter import convert
from bottom_case import BottomCase
from compartment_door import CompartmentDoor, CompartmentDoorSettings
from battery_holder import BatteryHolderSettings, BatteryHolder
from board import Board
from settings import CasemakerSettings

import logging

logging.basicConfig(level=logging.INFO)


class Casemaker:
    def __init__(self, settings: CasemakerSettings = CasemakerSettings()):
        self.settings = settings
        s = self.settings

        board_name = "__B$O$A$R$D__"

        self.shapes_dict = convert(
            self.settings.kicad_pcb_path, self.settings.cache_directory, board_name=board_name,
            exclude=s.parts_to_ignore_in_case_generation)

        self.board = Board(self.shapes_dict, board_name, s.board_settings)

        ### ----------------- Case -----------------###
        # TODO create a BottomCaseSettings dataclass and move the bottom case settings there, then extract the settings to CasemakerSettings
        self.bottom_case = BottomCase(self.board)
        self.bottom_case.override_dimension(s.bottom_case_dimension)
        self.bottom_case.override_offset(s.bottom_case_offset)
        self.bottom_case_cq_object = self.bottom_case.generate_case(
            s.case_wall_thickness, s.case_floor_max_thickness
        )

        bottom_case_open_face_bb = self.bottom_case_cq_object.faces(
            "<Z").val().BoundingBox()

        # TODO extract compartment door settings to CasemakerSettings, compartment door should be optional and individually configurable
        compartment_door_settings = None  # s.compartment_door_settings
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
            self.board.get_pcb_cq_object_with_tolerance())

        ### ----------------- Battery Holder -----------------###
        # TODO refactoring needed, and battery holder should be optional and individually configurable
        self.battery_holder = BatteryHolder(
            self.settings.battery_holder_settings)
        self.battery_holder.battery_holder = (self.battery_holder.battery_holder
                                              .rotate((0, 0, 0), (0, 1, 0), 180)
                                              .translate((
                                                  bottom_case_open_face_bb.center.x,
                                                  bottom_case_open_face_bb.center.y + 1.5,
                                                  bottom_case_open_face_bb.zmin))
                                              )
        self.battery_holder.battery_holder = self.battery_holder.battery_holder.cut(
            self.board.get_pcb_cq_object_with_tolerance())

        self.case_preview = (self.bottom_case_cq_object
                             .union(self.board.get_pcb_cq_object_with_tolerance())
                             .union(self.bottom_case_cq_object)
                             .union(self.compartment_door.door)
                             .union(self.battery_holder.battery_holder))


if __name__ == "__main__":
    from ocp_vscode import show_all

    casemaker = Casemaker(CasemakerSettings(
        battery_holder_settings=BatteryHolderSettings(
            front_wall_thickness=2.5,
            back_wall_thickness=1.5,
            insertable_springs_thickness=1,
            polartiy_text_spacing=0.3,
            battery_length_tolerance=4))
    )
    show_all({
        "board": casemaker.board._board_cq_object,
        "case_bottom": casemaker.bottom_case_cq_object,
        "compartment_door": casemaker.compartment_door.door,
        "battery_holder": casemaker.battery_holder.battery_holder,
    })
