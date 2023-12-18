from OCP.TopoDS import TopoDS_Shape
from cadquery import Vector
from board_converter import BoardConverter
from case import Case
from pcb import get_auto_detected_mounting_hole_settings
from compartment_door import CompartmentDoor
from battery_holder import BatteryHolder
from board import Board
from settings import *
from utils import get_rotation_for_side
from kicad_pcb_analyzer import find_missing_models_in_kicad_pcb, update_kicad_pcb_with_new_models, SexpModel

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
        Loads the kicad_pcb file and creates a Casemaker object from it.\n
        Note: This function will skip all step files that are not in the default kicad 3d model directory.
        If you want to use custom models, you need to use the analyze_kicad_pcb function first and
        update the missing_models list.

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

    def analyze_kicad_pcb(self, kicad_pcb_path: str):
        """
        Analyzes the kicad_pcb file and creates a CasemakerKiCadPcbAnalyzer object from it.

        :param kicad_pcb_path: Absolute path to the kicad_pcb file
        """
        missing_models = find_missing_models_in_kicad_pcb(kicad_pcb_path)
        return CasemakerKiCadPcbAnalyzer(self.cache_dir, kicad_pcb_path, missing_models)


class CasemakerKiCadPcbAnalyzer:
    """
    Do not use this class directly if you don't know what you are doing.\n
    Use the CasemakerLoader class instead.
    Helper class that analyzes and edits a kicad_pcb file and creates a Casemaker object from it.
    """

    def __init__(self, cache_directory: str, kicad_pcb_path: str, missing_models: list[SexpModel]):
        self.cache_dir = cache_directory
        self.kicad_pcb_path = kicad_pcb_path
        self.missing_models = missing_models

    def update_kicad_pcb_with_new_models(self, new_kicad_pcb_path: str = None):
        """
        Updates the kicad_pcb file with the missing models.\n
        The .missing_models list has to be updated before calling this function, else it will have no effect.\n

        example:
        ```python
        for missing_model in casemaker_analyzer.missing_models:
            # Get the new path here
            new_path = "/app/casemaker/43057230957234/upload/model/NewModel.step"
            missing_model["path"] = new_path
        casemaker_analyzer.update_kicad_pcb_with_new_models("new_board.kicad_pcb").to_casemaker()
        ```

        :param new_kicad_pcb_path: Absolute path to the new kicad_pcb file
        """
        if new_kicad_pcb_path is None:
            new_kicad_pcb_path = self.kicad_pcb_path
        self.kicad_pcb_path = update_kicad_pcb_with_new_models(
            self.kicad_pcb_path, self.missing_models)
        return self

    def to_casemaker(self, step_file: str = "board.step", force_reconvert: bool = False):
        """
        Converts the kicad_pcb file to a step file and creates a Casemaker object from it.

        :param step_file: Name of the file in the cache directory
        :param force_reconvert: Whether to force reconvert the step data
        """
        return CasemakerLoader(self.cache_dir).load_kicad_pcb(self.kicad_pcb_path, step_file, force_reconvert=force_reconvert)


class Casemaker:
    """
    Do not use this class directly if you don't know what you are doing.\n
    Use the CasemakerLoader class instead.
    """

    def __init__(self, board_shape: TopoDS_Shape, shapes_dict: dict[str, TopoDS_Shape], cache_dir: str = "parts"):
        self.board_shape = board_shape
        self.shapes_dict = shapes_dict
        self.cache_dir = cache_dir

    def generate_board(self, board_settings: BoardSettings = BoardSettings(), additional_parts: dict[str, TopoDS_Shape] = {}):
        """
        Generates a board object from the board shape and the shapes dictionary with the specified settings.

        :param board_settings: The settings for the board object.
        :param exclude: List of part names to exclude. Does not need to be the full name, only a part of it.
        (e.g. "PinHeader" will exclude all parts that contain "PinHeader" in their name, such as "PinHeader_1x2")
        :param additional_parts: A dictionary of names and TopoDS_Shape objects to add to the shapes dictionary.
        """
        shapes_dict = {**self.shapes_dict, **additional_parts}
        shapes_dict = {name: shape for name,
                       shape in shapes_dict.items() if not any(ex in name for ex in board_settings.exclude)}
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
        # set the dimensions of the compartment door to match the dimensions of the face where it is placed, if set to auto
        x, y, z = compartment_door_settings.compartment_door_dimensions
        if x == "Auto":
            x = face_width - 2 * self.case.settings.case_wall_thickness
        if y == "Auto":
            y = face_height - 2 * self.case.settings.case_wall_thickness
        if z == "Auto":
            z = self.case.settings.case_wall_thickness
        compartment_door_settings.compartment_door_dimensions = Vector(x, y, z)

        self.compartment_door = CompartmentDoor(compartment_door_settings)
        self.compartment_door.translate(
            (0, 0, -0.5 * self.case.settings.case_wall_thickness))

        # rotate the compartment door to match the side
        self.compartment_door.rotate(*get_rotation_for_side(side))

        # move the compartment door to the correct position
        self.compartment_door.translate(self.case.get_center_of_side(side))

        # cut out holes in the compartment door
        self.compartment_door.door_cq_object = self.compartment_door.door_cq_object.cut(
            self.case.get_cuts())

        # unite the compartment door frame with the case and keep tolerances to board
        self.compartment_door.frame_cq_object = self.compartment_door.frame_cq_object.cut(
            self.board.get_cq_objects_with_tolerances_union())
        if self.case.settings.pcb_slot_settings is not None:
            self.compartment_door.frame_cq_object = self.compartment_door.frame_cq_object.cut(
                self.board.get_pcb_extrusion(self.case.settings.pcb_slot_settings))
        self.case.case_cq_object = self.case.case_cq_object.cut(
            self.compartment_door.door_with_tolerance).union(
            self.compartment_door.frame_cq_object)

        return self

    def add_battery_holder(self, side: SIDE, battery_holder_settings: BatteryHolderSettings = BatteryHolderSettings()):
        """
        Adds a battery holder to the case at the specified side.
        Currently only one battery holder can be added per case.
        """
        self.battery_holder = BatteryHolder(battery_holder_settings)

        # rotate the battery holder to match the side
        self.battery_holder.rotate(*get_rotation_for_side(side))

        self.battery_holder.translate(self.case.get_center_of_side(side))
        self.battery_holder.translate(battery_holder_settings.offset)

        self.battery_holder.battery_holder_cq_object = self.battery_holder.battery_holder_cq_object.cut(
            self.case.get_cuts())
        return self

    def add_auto_detected_mounting_holes(self, side: SIDE, mounting_hole_diameter: float = 2.0, default_mounting_hole_settings: MountingHoleSettings = MountingHoleSettings()):
        """
        Adds mounting holes to the case at the positions where the board has holes with the exact specified diameter.

        :param side: The side where the mounting holes should be added.
        :param mounting_hole_diameter: The diameter which the board holes need to have to be detected as mounting holes.
        :param default_mounting_hole_settings: The default settings for the mounting holes. (the diameter will be overwritten)
        """
        default_mounting_hole_settings.diameter = mounting_hole_diameter
        return self.add_mounting_holes(side, get_auto_detected_mounting_hole_settings(
            self.board.pcb_cq_object, default_mounting_hole_settings))

    def add_mounting_holes(self, side: Literal[SIDE.TOP, SIDE.BOTTOM], mounting_hole_settings_list: list[MountingHoleSettings]):
        """
        Adds mounting holes to the case with the specified settings.

        :param side: The side where the mounting holes should be added.
        :param mounting_hole_settings_list: The list of settings for the mounting holes. One setting is needed for each mounting hole.
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
    import esplant_default_settings

    logging.basicConfig(level=logging.INFO)

    # How to analyze a kicad_pcb file and update it with new models:
    # casemaker_analyzer = (CasemakerLoader()
    #                       .analyze_kicad_pcb("ESPlant-Board/ESPlant-Board.kicad_pcb")
    #                       )
    # for missing_model in casemaker_analyzer.missing_models:
    #     missing_model["path"] = "/app/casemaker/43057230957234/upload/model/NewModel.step"
    # casemaker = (casemaker_analyzer
    #              .update_kicad_pcb_with_new_models()
    #              .to_casemaker()
    #              .save_step_file()
    #              )

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
                 .generate_board(esplant_default_settings.board_settings, esplant_default_settings.additional_parts)
                 .generate_case(esplant_default_settings.case_settings)
                 .add_compartment_door(SIDE.BOTTOM, esplant_default_settings.compartment_door_settings)
                 .add_battery_holder(SIDE.BOTTOM, esplant_default_settings.battery_holder_settings)
                 .add_auto_detected_mounting_holes(SIDE.TOP, mounting_hole_diameter=esplant_default_settings.mounting_hole_diameter)
                 # .add_mounting_holes(SIDE.TOP, [...])
                 )

    show_all({
        "board": casemaker.board.board_cq_object,
        "case": casemaker.case.case_cq_object,
        "compartment_door": casemaker.compartment_door.door_cq_object,
        "battery_holder": casemaker.battery_holder.battery_holder_cq_object,
        # "batteries": casemaker.battery_holder.batteries_cq_object,
    })
