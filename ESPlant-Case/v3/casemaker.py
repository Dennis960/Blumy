from OCP.TopoDS import TopoDS_Shape
from board_converter import BoardConverter
from bottom_case import BottomCase
from compartment_door import CompartmentDoor, CompartmentDoorSettings
from battery_holder import BatteryHolderSettings, BatteryHolder
from board import Board
from settings import CaseSettings, BoardSettings, SIDE

# TODO remove this, it is only a workaround
board_name = "__B$O$A$R$D__"


class CasemakerLoader:
    """
    Helper class to load different file formats and create a Casemaker object from it.
    """

    def __init__(self, cache_directory: str):
        self.cache_directory = cache_directory
        self._exclude: list[str] = []

    def exclude_parts(self, *exclude):
        """
        Set the parts to exclude from the conversion.
        :param exclude: List of part names to exclude. Does not need to be the full name, only a part of it.
        (e.g. "PinHeader" will exclude all parts that contain "PinHeader" in their name, such as "PinHeader_1x2")
        """
        self._exclude = exclude
        return self

    def load_kicad_pcb(self, kicad_pcb_path: str):
        """
        Loads the kicad_pcb file and creates a Casemaker object from it.
        """
        shapes_dict = (BoardConverter(self.cache_directory)
                       ._override_unique_board_name(board_name)
                       .exclude_parts(*self._exclude)
                       .from_kicad_pcb(kicad_pcb_path)
                       )
        return Casemaker(shapes_dict)

    def load_step_file(self, step_path: str):
        """
        Loads the step file and creates a Casemaker object from it.
        """
        shapes_dict = (BoardConverter(self.cache_directory)
                       ._override_unique_board_name(board_name)
                       .from_step_file(step_path)
                       )
        return Casemaker(shapes_dict)


class Casemaker:
    def __init__(self, shapes_dict: dict[str, TopoDS_Shape]):
        self.shapes_dict = shapes_dict
        self.board: Board = None
        self.bottom_case: BottomCase = None
        self.compartment_door: CompartmentDoor = None
        self.battery_holder: BatteryHolder = None

    def generate_board(self, board_settings: BoardSettings = BoardSettings()):
        self.board = Board(self.shapes_dict, board_name, board_settings)
        return self

    def generate_case(self, case_settings: CaseSettings = CaseSettings()):
        if (self.board is None):
            raise Exception(
                "Board has to be generated before generating the case")
        self.bottom_case = BottomCase(self.board)
        self.bottom_case.override_dimension(
            case_settings.bottom_case_dimension)
        self.bottom_case.override_offset(case_settings.bottom_case_offset)
        self.bottom_case_cq_object = self.bottom_case.generate_case(
            case_settings.case_wall_thickness, case_settings.case_floor_max_thickness
        )
        self.case_wall_thickness = case_settings.case_wall_thickness
        return self

    def add_compartment_door(self, side: SIDE, compartment_door_settings: CompartmentDoorSettings = None):
        # TODO implement face_selector
        self.bottom_case_open_face_bb = self.bottom_case_cq_object.faces(
            "<Z").val().BoundingBox()

        compartment_door_settings = None
        if compartment_door_settings is None:
            compartment_door_settings = CompartmentDoorSettings(
                compartment_door_dimensions=(
                    self.bottom_case_open_face_bb.xlen - 2 * self.case_wall_thickness, self.bottom_case_open_face_bb.ylen - 2 * self.case_wall_thickness, 1.5),
                tab_spacing_factor=0.8
            )
        self.compartment_door = CompartmentDoor(compartment_door_settings)

        # flip the compartment door
        self.compartment_door.flip()
        # move the compartment door to the top of the case
        self.compartment_door.move(
            self.bottom_case_open_face_bb.center.x,
            self.bottom_case_open_face_bb.center.y,
            self.bottom_case_open_face_bb.center.z + 0.5 * self.case_wall_thickness,
        )

        self.bottom_case_cq_object = self.bottom_case_cq_object.union(self.compartment_door.frame).cut(
            self.compartment_door.door_with_tolerance).cut(self.bottom_case.get_cuts())
        self.compartment_door.door = self.compartment_door.door.cut(
            self.board.get_pcb_cq_object_with_tolerance())
        return self

    def add_battery_holder(self, side: SIDE, battery_holder_settings: BatteryHolderSettings = None):
        ### ----------------- Battery Holder -----------------###
        # TODO refactoring needed, and battery holder should be optional and individually configurable
        self.battery_holder = BatteryHolder(
            battery_holder_settings)
        self.battery_holder.battery_holder = (self.battery_holder.battery_holder
                                              .rotate((0, 0, 0), (0, 1, 0), 180)
                                              .translate((
                                                  self.bottom_case_open_face_bb.center.x,
                                                  self.bottom_case_open_face_bb.center.y + 1.5,
                                                  self.bottom_case_open_face_bb.zmin))
                                              )
        self.battery_holder.battery_holder = self.battery_holder.battery_holder.cut(
            self.board.get_pcb_cq_object_with_tolerance())

        self.case_preview = (self.bottom_case_cq_object
                             .union(self.board.get_pcb_cq_object_with_tolerance())
                             .union(self.bottom_case_cq_object)
                             .union(self.compartment_door.door)
                             .union(self.battery_holder.battery_holder))
        return self


if __name__ == "__main__":
    from ocp_vscode import show_all
    import logging

    logging.basicConfig(level=logging.INFO)

    casemaker = (CasemakerLoader("parts")
                 .exclude_parts("PinHeader")
                 .load_kicad_pcb("ESPlant-Board/ESPlant-Board.kicad_pcb")
                 .generate_board()
                 .generate_case()
                 .add_compartment_door(SIDE.BOTTOM)
                 .add_battery_holder(SIDE.BOTTOM, BatteryHolderSettings(
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
