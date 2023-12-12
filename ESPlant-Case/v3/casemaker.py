from OCP.TopoDS import TopoDS_Shape
from board_converter import BoardConverter
from case import Case
from compartment_door import CompartmentDoor, CompartmentDoorSettings
from battery_holder import BatteryHolderSettings, BatteryHolder
from board import Board
from settings import CaseSettings, BoardSettings, SIDE
from components import battery_springs
from cadquery import Vector

# TODO remove this, it is only a workaround
board_name = "__B$O$A$R$D__"


class CasemakerLoader:
    """
    Helper class to load different file formats and create a Casemaker object from it.
    """

    def __init__(self, cache_directory: str):
        self.cache_directory = cache_directory
        self._exclude: list[str] = []
        self._additional_parts: dict[str, TopoDS_Shape] = {}

    def exclude_parts(self, *exclude):
        """
        Set the parts to exclude from the casemaker.
        :param exclude: List of part names to exclude. Does not need to be the full name, only a part of it.
        (e.g. "PinHeader" will exclude all parts that contain "PinHeader" in their name, such as "PinHeader_1x2")
        """
        self._exclude = exclude
        return self

    def load_additional_parts(self, additional_parts: dict[str, TopoDS_Shape]):
        """
        Loads additional parts into the casemaker.
        :param additional_parts: A dictionary of names and TopoDS_Shape objects.
        """
        self._additional_parts = additional_parts
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
        self.case: Case = None
        self.compartment_door: CompartmentDoor = None
        self.battery_holder: BatteryHolder = None

    def generate_board(self, board_settings: BoardSettings = BoardSettings()):
        self.board = Board(self.shapes_dict, board_name, board_settings)
        return self

    def generate_case(self, case_settings: CaseSettings = CaseSettings()):
        if (self.board is None):
            raise Exception(
                "Call generate_board before calling generate_case")
        self.case = Case(self.board, case_settings)
        return self

    def add_compartment_door(self, side: SIDE, compartment_door_settings: CompartmentDoorSettings = CompartmentDoorSettings()):
        if (self.case is None):
            raise Exception(
                "Call generate_case before calling add_compartment_door")
        self.case_open_face_bb = self.case.case_cq_object.faces(
            side.value).val().BoundingBox()

        if side is SIDE.BOTTOM or side is SIDE.TOP:
            face_width = self.case_open_face_bb.xlen
            face_height = self.case_open_face_bb.ylen
        elif side is SIDE.LEFT or side is SIDE.RIGHT:
            face_width = self.case_open_face_bb.zlen
            face_height = self.case_open_face_bb.ylen
        elif side is SIDE.FRONT or side is SIDE.BACK:
            face_width = self.case_open_face_bb.xlen
            face_height = self.case_open_face_bb.zlen

        compartment_door_settings.compartment_door_dimensions = Vector(
            face_width - 2 * self.case.settings.case_wall_thickness, face_height - 2 * self.case.settings.case_wall_thickness, 1.5)

        self.compartment_door = CompartmentDoor(compartment_door_settings)
        self.compartment_door.move(
            0, 0, -0.5 * self.case.settings.case_wall_thickness)

        # rotate the compartment door to match the side
        if side is SIDE.BOTTOM:
            self.compartment_door.rotate(
                (0, 0, 0), (0, 1, 0), 180)
        elif side is SIDE.LEFT:
            self.compartment_door.rotate(
                (0, 0, 0), (0, 1, 0), -90)
        elif side is SIDE.RIGHT:
            self.compartment_door.rotate(
                (0, 0, 0), (0, 1, 0), 90)
        elif side is SIDE.TOP:
            pass
        elif side is SIDE.FRONT:
            self.compartment_door.rotate(
                (0, 0, 0), (1, 0, 0), -90)
        elif side is SIDE.BACK:
            self.compartment_door.rotate(
                (0, 0, 0), (1, 0, 0), 90)

        # move the compartment door to the correct position
        self.compartment_door.move(
            self.case_open_face_bb.center.x,
            self.case_open_face_bb.center.y,
            self.case_open_face_bb.center.z,
        )

        self.case.case_cq_object = self.case.case_cq_object.union(self.compartment_door.frame).cut(
            self.compartment_door.door_with_tolerance).cut(self.case.get_cuts())
        self.compartment_door.door = self.compartment_door.door.cut(
            self.board.get_pcb_cq_object_with_tolerance())
        return self

    def add_battery_holder(self, side: SIDE, battery_holder_settings: BatteryHolderSettings = None):
        if (self.case is None):
            raise Exception(
                "Call generate_case before calling add_battery_holder")
        # TODO implement side
        self.battery_holder = BatteryHolder(
            battery_holder_settings)
        self.battery_holder.battery_holder = (self.battery_holder.battery_holder
                                              .rotate((0, 0, 0), (0, 1, 0), 180)
                                              .translate((
                                                  self.case_open_face_bb.center.x,
                                                  self.case_open_face_bb.center.y + 1.5,
                                                  self.case_open_face_bb.zmin))
                                              )
        self.battery_holder.battery_holder = self.battery_holder.battery_holder.cut(
            self.board.get_pcb_cq_object_with_tolerance())

        self.case_preview = (self.case.case_cq_object
                             .union(self.board.get_pcb_cq_object_with_tolerance())
                             .union(self.case.case_cq_object)
                             .union(self.compartment_door.door)
                             .union(self.battery_holder.battery_holder))
        return self


if __name__ == "__main__":
    from ocp_vscode import show_all
    import logging

    logging.basicConfig(level=logging.INFO)

    casemaker = (CasemakerLoader("parts")
                 .exclude_parts("PinHeader")
                 .load_additional_parts({
                     "BatterySprings": battery_springs.val().wrapped,
                 })
                 .load_kicad_pcb("ESPlant-Board/ESPlant-Board.kicad_pcb")
                 .generate_board()
                 .generate_case()
                 .add_compartment_door(SIDE.BOTTOM, CompartmentDoorSettings(
                     tab_spacing_factor=0.8,
                 ))
                 .add_battery_holder(SIDE.BOTTOM, BatteryHolderSettings(
                     front_wall_thickness=2.5,
                     back_wall_thickness=1.5,
                     insertable_springs_thickness=1,
                     polartiy_text_spacing=0.3,
                     battery_length_tolerance=4
                 ))
                 )

    show_all({
        "board": casemaker.board._board_cq_object,
        "case_bottom": casemaker.case.case_cq_object,
        "compartment_door": casemaker.compartment_door.door,
        "battery_holder": casemaker.battery_holder.battery_holder,
    })
