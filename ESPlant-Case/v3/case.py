import cadquery as cq
from utils import extrude_part_faces
from board import Board
from settings import ALIGNMENT, DIMENSION_TYPE, Offset, Dimension, CaseSettings


class Case:
    def __init__(self, board: Board, case_settings: CaseSettings = CaseSettings()):
        self.board = board
        self.case_dimension: Dimension = (
            DIMENSION_TYPE.AUTO,
            DIMENSION_TYPE.AUTO,
            DIMENSION_TYPE.AUTO,
        )
        self.settings = case_settings
        self.case_offset: Offset = (0, 0, 0)
        # union_of_bounding_boxes is the union of all bounding boxes of all parts with their tolerances and offsets
        self.union_of_bounding_boxes = self.board.get_cq_objects_with_tolerances_union()
        self.case_bounding_box = self.union_of_bounding_boxes.val().BoundingBox()
        self.override_dimension(
            case_settings.case_dimension)
        self.override_offset(case_settings.case_offset)
        self.case_cq_object = self.generate_case(
            case_settings.case_wall_thickness, case_settings.case_floor_max_thickness
        )

    def calculate_dimension(self, bb_len, dim_len):
        if dim_len is DIMENSION_TYPE.AUTO:
            return bb_len
        else:
            return dim_len

    def override_dimension(self, case_dimension: Dimension):
        self.case_dimension = (
            self.calculate_dimension(
                self.case_bounding_box.xlen, case_dimension[0]
            ),
            self.calculate_dimension(
                self.case_bounding_box.ylen, case_dimension[1]
            ),
            self.calculate_dimension(
                self.case_bounding_box.zlen, case_dimension[2]
            ),
        )
        # Update the offset for the new dimension
        self.override_offset(self.case_offset)

    def calculate_offset(self, bb_len, dim_len, off_val):
        if off_val is ALIGNMENT.POSITIVE:
            return bb_len / 2 - dim_len / 2
        elif off_val is ALIGNMENT.NEGATIVE:
            return -bb_len / 2 + dim_len / 2
        else:
            return off_val

    def override_offset(self, case_offset: Offset):
        self.case_offset = (
            self.calculate_offset(
                self.case_bounding_box.xlen,
                self.case_dimension[0],
                case_offset[0],
            ),
            self.calculate_offset(
                self.case_bounding_box.ylen,
                self.case_dimension[1],
                case_offset[1],
            ),
            self.calculate_offset(
                self.case_bounding_box.zlen,
                self.case_dimension[2],
                case_offset[2],
            ),
        )

    def get_cuts(self):
        """
        Returns a cq object that is the union of all objects that need to be cut out of the bottom case
        Including holes and parts
        """
        cuts = self.union_of_bounding_boxes
        cuts = cuts.union(self.board.get_holes_union())
        return cuts

    def generate_case(self, case_wall_thickness, floor_height):
        case_center = self.union_of_bounding_boxes.val().CenterOfBoundBox()
        case_box = (
            cq.Workplane("XY")
            .box(
                self.case_dimension[0],
                self.case_dimension[1],
                self.case_dimension[2],
            )
            .translate(case_center)
        )
        case_box = case_box.translate(self.case_offset)
        case_shell = case_box.faces("<Z").shell(
            case_wall_thickness, kind="intersection"
        )

        case_shell = case_shell.union(
            extrude_part_faces(
                case_shell, "<Z", floor_height, faces_selector=">Z[-2]"
            )
        )

        # cut out holes and parts
        case_shell = case_shell.cut(self.get_cuts())
        return case_shell
