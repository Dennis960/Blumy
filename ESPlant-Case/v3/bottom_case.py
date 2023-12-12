import cadquery as cq
from utils import extrude_part_faces
from typing import NewType
from board import Board, DIMENSION_TYPE, ALIGNMENT

Dimension = NewType(
    "BottomCaseDimension",
    tuple[float | DIMENSION_TYPE, float |
          DIMENSION_TYPE, float | DIMENSION_TYPE],
)
Offset = NewType(
    "BottomCaseOffset", tuple[float | ALIGNMENT,
                              float | ALIGNMENT, float | ALIGNMENT]
)


class BottomCase:
    def __init__(self, board: Board):
        self.board = board
        self.bottom_case_dimension: Dimension = (
            DIMENSION_TYPE.AUTO,
            DIMENSION_TYPE.AUTO,
            DIMENSION_TYPE.AUTO,
        )
        self.bottom_case_offset: Offset = (0, 0, 0)
        # union_of_bounding_boxes is the union of all bounding boxes of all parts with their tolerances and offsets
        self.union_of_bounding_boxes = self.board.get_cq_objects_with_tolerances_union()
        self.bottom_case_bounding_box = self.union_of_bounding_boxes.val().BoundingBox()

    def calculate_dimension(self, bb_len, dim_len):
        if dim_len is DIMENSION_TYPE.AUTO:
            return bb_len
        else:
            return dim_len

    def override_dimension(self, bottom_case_dimension: Dimension):
        self.bottom_case_dimension = (
            self.calculate_dimension(
                self.bottom_case_bounding_box.xlen, bottom_case_dimension[0]
            ),
            self.calculate_dimension(
                self.bottom_case_bounding_box.ylen, bottom_case_dimension[1]
            ),
            self.calculate_dimension(
                self.bottom_case_bounding_box.zlen, bottom_case_dimension[2]
            ),
        )
        # Update the offset for the new dimension
        self.override_offset(self.bottom_case_offset)

    def calculate_offset(self, bb_len, dim_len, off_val):
        if off_val is ALIGNMENT.POSITIVE:
            return bb_len / 2 - dim_len / 2
        elif off_val is ALIGNMENT.NEGATIVE:
            return -bb_len / 2 + dim_len / 2
        else:
            return off_val

    def override_offset(self, bottom_case_offset: Offset):
        self.bottom_case_offset = (
            self.calculate_offset(
                self.bottom_case_bounding_box.xlen,
                self.bottom_case_dimension[0],
                bottom_case_offset[0],
            ),
            self.calculate_offset(
                self.bottom_case_bounding_box.ylen,
                self.bottom_case_dimension[1],
                bottom_case_offset[1],
            ),
            self.calculate_offset(
                self.bottom_case_bounding_box.zlen,
                self.bottom_case_dimension[2],
                bottom_case_offset[2],
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
        bottom_case_center = self.union_of_bounding_boxes.val().CenterOfBoundBox()
        bottom_case_box = (
            cq.Workplane("XY")
            .box(
                self.bottom_case_dimension[0],
                self.bottom_case_dimension[1],
                self.bottom_case_dimension[2],
            )
            .translate(bottom_case_center)
        )
        bottom_case_box = bottom_case_box.translate(self.bottom_case_offset)
        bottom_case_shell = bottom_case_box.faces("<Z").shell(
            case_wall_thickness, kind="intersection"
        )

        bottom_case_shell = bottom_case_shell.union(
            extrude_part_faces(
                bottom_case_shell, "<Z", floor_height, faces_selector=">Z[-2]"
            )
        )

        # cut out holes and parts
        bottom_case_shell = bottom_case_shell.cut(self.get_cuts())
        return bottom_case_shell
