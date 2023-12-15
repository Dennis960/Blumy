from OCP.TopoDS import TopoDS_Shape
from cadquery import Vector
from board_converter import BoardConverter
from case import Case
from pcb import get_auto_detected_mounting_hole_settings
from compartment_door import CompartmentDoor
from battery_holder import BatteryHolder
from board import Board
from settings import *
from components import battery_springs
from utils import get_rotation_for_side

from serializer import register
register()


class CasemakerLoader:
    """
    Helper class to load different file formats and create a Casemaker object from it.
    """

    def __init__(self, cache_directory: str = "parts"):
        self.cache_dir = cache_directory

    def load_kicad_pcb(self, kicad_pcb_path: str, step_file: str = "board.step", force_reconvert: bool = False):
        """
        Loads the kicad_pcb file and creates a Casemaker object from it.

        :param kicad_pcb_path: Absolute path to the kicad_pcb file
        :param step_file: Name of the file in the cache directory
        """
        board_shape, shapes_dict = (BoardConverter(self.cache_dir)
                                    .from_kicad_pcb(kicad_pcb_path, step_file, force_reconvert=force_reconvert)
                                    )
        return Casemaker(board_shape, shapes_dict, self.cache_dir)

    def load_step_file(self, step_file: str = "board.step"):
        """
        Loads the step file and creates a Casemaker object from it.

        :param step_file: Name of the file in the cache directory
        """
        board_shape, shapes_dict = (BoardConverter(self.cache_dir)
                                    .from_step_file(step_file)
                                    )
        return Casemaker(board_shape, shapes_dict, self.cache_dir)

    def load_pickle(self, pickle_file: str = "board.pickle"):
        """
        Loads the pickle file and creates a Casemaker object from it.

        :param pickle_file: Name of the pickle file
        """
        board_shape, shapes_dict = (BoardConverter(self.cache_dir)
                                    .from_pickle(pickle_file)
                                    )
        return Casemaker(board_shape, shapes_dict, self.cache_dir)


class Casemaker:
    """
    Do not use this class directly if you don't know what you are doing.\n
    Use the CasemakerLoader class instead.
    """

    def __init__(self, board_shape: TopoDS_Shape, shapes_dict: dict[str, TopoDS_Shape], cache_dir: str = "parts"):
        self.board_shape = board_shape
        self.shapes_dict = shapes_dict
        self.cache_dir = cache_dir

    def generate_board(self, board_settings: BoardSettings = BoardSettings(), exclude: list[str] = [], additional_parts: dict[str, TopoDS_Shape] = {}):
        """
        Generates a board object from the board shape and the shapes dictionary with the specified settings.

        :param board_settings: The settings for the board object.
        :param exclude: List of part names to exclude. Does not need to be the full name, only a part of it.
        (e.g. "PinHeader" will exclude all parts that contain "PinHeader" in their name, such as "PinHeader_1x2")
        :param additional_parts: A dictionary of names and TopoDS_Shape objects to add to the shapes dictionary.
        """
        shapes_dict = {**self.shapes_dict, **additional_parts}
        shapes_dict = {name: shape for name,
                       shape in shapes_dict.items() if not any(ex in name for ex in exclude)}
        for shape in additional_parts.values():
            self.board_shape = (cq.Workplane(cq.Shape.cast(
                self.board_shape)).union(cq.Workplane(cq.Shape.cast(shape)))).val().wrapped
        board = Board(self.board_shape, shapes_dict, board_settings)
        return CasemakerWithBoard(self.board_shape, self.shapes_dict, board)

    def save_pickle(self, pickle_file: str = "board.pickle"):
        """
        Saves the board_shape and shapes_dict to a pickle file.

        :param pickle_file: Name of the pickle file
        """
        BoardConverter(self.cache_dir).save_to_pickle(
            self.board_shape, self.shapes_dict, pickle_file)
        return self

    def save_step_file(self, step_file: str = "board-saved.step"):
        """
        Saves the board with its components as a step file.

        :param step_file: Name of the step file
        """
        BoardConverter(self.cache_dir).save_assembly(
            self.shapes_dict, step_file, exportType="STEP")
        return self

    def save_gltf_file(self, gltf_file: str = "board.gltf", tolerance: float = 0.1, angularTolerance: float = 0.1):
        """
        Saves the board with its components as a gltf file.

        :param gltf_file: Name of the gltf file
        """
        BoardConverter(self.cache_dir).save_assembly(
            self.shapes_dict, gltf_file, exportType="GLTF", tolerance=tolerance, angularTolerance=angularTolerance)
        return self


class CasemakerWithBoard:
    """
    Do not use this class directly if you don't know what you are doing.\n
    Use the CasemakerLoader class instead.
    """

    def __init__(self, board_shape: TopoDS_Shape, shapes_dict: dict[str, TopoDS_Shape], board: Board):
        self.board_shape = board_shape
        self.shapes_dict = shapes_dict
        self.board = board

    def generate_case(self, case_settings: CaseSettings = CaseSettings()):
        """
        Generates a case object using information from the board object.
        """
        case = Case(self.board, case_settings)
        case.case_cq_object = case.case_cq_object.cut(case.get_cuts())
        return CasemakerWithCase(self.board_shape, self.shapes_dict, self.board, case)


class CasemakerWithCase:
    """
    Do not use this class directly if you don't know what you are doing.\n
    Use the CasemakerLoader class instead.
    """

    def __init__(self, board_shape: TopoDS_Shape, shapes_dict: dict[str, TopoDS_Shape], board: Board, case: Case):
        self.board_shape = board_shape
        self.shapes_dict = shapes_dict
        self.board = board
        self.case = case
        self.compartment_door: CompartmentDoor = None
        self.battery_holder: BatteryHolder = None

    def add_compartment_door(self, side: SIDE, compartment_door_settings: CompartmentDoorSettings = CompartmentDoorSettings()):
        """
        Adds a compartment door to the case at the specified side.
        Currently only one compartment door can be added per case.
        """
        face_width, face_height = self.case.get_dimension_of_side(side)

        # set the dimensions of the compartment door to match the dimensions of the face where it is placed
        compartment_door_settings.compartment_door_dimensions = Vector(
            face_width - 2 * self.case.settings.case_wall_thickness, face_height - 2 * self.case.settings.case_wall_thickness, 1.5)

        self.compartment_door = CompartmentDoor(compartment_door_settings)
        self.compartment_door.translate(
            (0, 0, -0.5 * self.case.settings.case_wall_thickness))

        # rotate the compartment door to match the side
        self.compartment_door.rotate(*get_rotation_for_side(side))

        # move the compartment door to the correct position
        self.compartment_door.translate(self.case.get_center_of_side(side))

        # unite the compartment door frame with the case
        self.case.case_cq_object = self.case.case_cq_object.union(
            self.compartment_door.frame).cut(
            self.compartment_door.door_with_tolerance)
        self.compartment_door.door_cq_object = self.compartment_door.door_cq_object.cut(
            self.case.get_cuts())
        return self

    def add_battery_holder(self, side: SIDE, battery_holder_settings: BatteryHolderSettings = None):
        """
        Adds a battery holder to the case at the specified side.
        Currently only one battery holder can be added per case.
        """
        self.battery_holder = BatteryHolder(battery_holder_settings)

        # rotate the battery holder to match the side
        self.battery_holder.rotate(*get_rotation_for_side(side))

        self.battery_holder.translate(self.case.get_center_of_side(side))

        self.battery_holder.battery_holder_cq_object = self.battery_holder.battery_holder_cq_object.cut(
            self.case.get_cuts())
        return self

    def add_auto_detected_mounting_holes(self, side: SIDE, mounting_hole_diameter: float = 2.0, default_mounting_hole_settings: MountingHoleSettings = MountingHoleSettings()):
        """
        Adds mounting holes to the case at the positions where the board has holes with the exact specified diameter.

        :param mounting_hole_diameter: The diameter which the board holes need to have to be detected as mounting holes.
        :param default_mounting_hole_settings: The default settings for the mounting holes. (the diameter will be overwritten)
        """
        default_mounting_hole_settings.diameter = mounting_hole_diameter
        return self.add_mounting_holes(side, get_auto_detected_mounting_hole_settings(
            self.board.pcb_cq_object, default_mounting_hole_settings))

    def add_mounting_holes(self, side: Literal[SIDE.TOP, SIDE.BOTTOM], mounting_hole_settings_list: list[MountingHoleSettings]):
        """
        Adds mounting holes to the case with the specified settings.
        """
        pcb_cq_object_with_tolerance = self.board.get_pcb_cq_object_with_tolerance()
        pcb_face = pcb_cq_object_with_tolerance.faces(
            side.value).val()
        pcb_with_tolerance_thickness = self.board.get_pcb_with_tolerance_thickness()
        pcb_face_z = pcb_face.Center().z
        case_wall_z = self.case.case_outer_bounding_box.zmin if side is SIDE.BOTTOM else self.case.case_outer_bounding_box.zmax
        extrusion_length = (
            pcb_face_z - case_wall_z if side is SIDE.BOTTOM else case_wall_z - pcb_face_z)

        for mounting_hole_settings in mounting_hole_settings_list:
            inner_diameter = mounting_hole_settings.diameter
            outer_diameter = mounting_hole_settings.pad_diameter
            if mounting_hole_settings.hole_type == "Through-Hole":
                inner_diameter -= mounting_hole_settings.tolerance
            elif mounting_hole_settings.hole_type == "Standoff":
                inner_diameter += mounting_hole_settings.tolerance

            outer_mounting_hole_cq_object = (cq.Workplane(pcb_face)
                                             .workplane(centerOption="ProjectedOrigin")
                                             .moveTo(mounting_hole_settings.position.x, mounting_hole_settings.position.y)
                                             .circle(outer_diameter / 2)
                                             .extrude(extrusion_length)
                                             )

            inner_mounting_hole_cq_object = (cq.Workplane(pcb_face)
                                             .workplane(centerOption="ProjectedOrigin")
                                             .tag("a")
                                             .moveTo(mounting_hole_settings.position.x, mounting_hole_settings.position.y)
                                             .circle(inner_diameter / 2)
                                             .extrude(extrusion_length)
                                             .workplaneFromTagged("a")
                                             .moveTo(mounting_hole_settings.position.x, mounting_hole_settings.position.y)
                                             .circle(inner_diameter / 2)
                                             .extrude(-pcb_with_tolerance_thickness)
                                             )

            if mounting_hole_settings.hole_type == "Through-Hole":
                mounting_hole_cq_object = outer_mounting_hole_cq_object.union(
                    inner_mounting_hole_cq_object)
            elif mounting_hole_settings.hole_type == "Standoff":
                mounting_hole_cq_object = outer_mounting_hole_cq_object.cut(
                    inner_mounting_hole_cq_object)

            self.case.case_cq_object = self.case.case_cq_object.union(
                mounting_hole_cq_object)

        return self


if __name__ == "__main__":
    from ocp_vscode import show_all
    import logging
    import os

    logging.basicConfig(level=logging.INFO)

    if not os.path.exists("parts/board.pickle"):
        CasemakerLoader().load_kicad_pcb(
            "ESPlant-Board/ESPlant-Board.kicad_pcb").save_pickle()

    casemaker = (CasemakerLoader()
                 .load_pickle("board.pickle")
                 # .load_kicad_pcb("ESPlant-Board/ESPlant-Board.kicad_pcb", force_reconvert=True)
                 # .load_step_file("board.step")
                 # .save_step_file("board-saved.step")
                 # .save_pickle("board.pickle")
                 # .save_gltf_file("board.gltf")
                 .generate_board(BoardSettings(), exclude=["PinHeader"], additional_parts={
                     "BatterySprings": battery_springs.val().wrapped,
                 })
                 .generate_case(CaseSettings(
                     case_dimension=("Auto", 62, 11),
                     case_offset=(0, "Positive", "Positive")
                 ))
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
                 .add_auto_detected_mounting_holes(SIDE.TOP, mounting_hole_diameter=2.2)
                 # .add_mounting_holes(SIDE.TOP, [
                 #     MountingHoleSettings(
                 #         diameter=3,
                 #         position=(0, 0),
                 #         hole_type="Through-Hole",
                 #         pad_diameter=5,
                 #         tolerance=0.2
                 #     ),
                 #     MountingHoleSettings(
                 #         diameter=3,
                 #         position=(10, 0),
                 #         hole_type="Standoff",
                 #         pad_diameter=5,
                 #         tolerance=0.2
                 #     )
                 # ])
                 )

    show_all({
        "board": casemaker.board.board_cq_object,
        "case": casemaker.case.case_cq_object,
        "compartment_door": casemaker.compartment_door.door_cq_object,
        "battery_holder": casemaker.battery_holder.battery_holder_cq_object,
        # "batteries": casemaker.battery_holder.batteries_cq_object,
    })
