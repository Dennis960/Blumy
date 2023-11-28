import cadquery as cq
from cq_part import DIMENSION_TYPE, ALIGNMENT, PartList
from utils import extrude_part_faces
from typing import NewType

Dimension = NewType("BottomCaseDimension", tuple[float | DIMENSION_TYPE, float | DIMENSION_TYPE, float | DIMENSION_TYPE])
Offset = NewType("BottomCaseOffset", tuple[float | ALIGNMENT, float | ALIGNMENT, float | ALIGNMENT])

class BottomCase():
    def __init__(self, part_list: PartList):
        self.part_list = part_list
        self.bottom_case_dimension: Dimension = (DIMENSION_TYPE.AUTO, DIMENSION_TYPE.AUTO, DIMENSION_TYPE.AUTO)
        self.bottom_case_offset: Offset = (0, 0, 0)
        # union_of_bounding_boxes is the union of all bounding boxes of all parts with their tolerances and offsets
        self.union_of_bounding_boxes = self.part_list.get_bounding_box_union()
        self.bottom_case_bounding_box = self.union_of_bounding_boxes.val().BoundingBox()
    
    def override_dimension(self, bottom_case_dimension: Dimension):
        self.bottom_case_dimension = (
            self.bottom_case_bounding_box.xlen if bottom_case_dimension[0] is DIMENSION_TYPE.AUTO else bottom_case_dimension[0],
            self.bottom_case_bounding_box.ylen if bottom_case_dimension[1] is DIMENSION_TYPE.AUTO else bottom_case_dimension[1],
            self.bottom_case_bounding_box.zlen if bottom_case_dimension[2] is DIMENSION_TYPE.AUTO else bottom_case_dimension[2],
        )
        # Update the offset for the new dimension
        self.override_offset(self.bottom_case_offset)
    
    def override_offset(self, bottom_case_offset: Offset):
        self.bottom_case_offset = (
            self.bottom_case_bounding_box.xlen / 2 - self.bottom_case_dimension[0] /2 if bottom_case_offset[0] is ALIGNMENT.POSITIVE else - self.bottom_case_bounding_box.xlen / 2 + self.bottom_case_dimension[0] /2 if bottom_case_offset[0] is ALIGNMENT.NEGATIVE else bottom_case_offset[0],
            self.bottom_case_bounding_box.ylen / 2 - self.bottom_case_dimension[1] /2 if bottom_case_offset[1] is ALIGNMENT.POSITIVE else - self.bottom_case_bounding_box.ylen / 2 + self.bottom_case_dimension[1] /2 if bottom_case_offset[1] is ALIGNMENT.NEGATIVE else bottom_case_offset[1],
            self.bottom_case_bounding_box.zlen / 2 - self.bottom_case_dimension[2] /2 if bottom_case_offset[2] is ALIGNMENT.POSITIVE else - self.bottom_case_bounding_box.zlen / 2 + self.bottom_case_dimension[2] /2 if bottom_case_offset[2] is ALIGNMENT.NEGATIVE else bottom_case_offset[2],
        )
    
    def generate_case(self, case_wall_thickness):
        bottom_case_center = self.union_of_bounding_boxes.val().CenterOfBoundBox()
        bottom_case_box = cq.Workplane("XY").box(self.bottom_case_dimension[0], self.bottom_case_dimension[1], self.bottom_case_dimension[2]).translate(bottom_case_center)
        bottom_case_box = bottom_case_box.translate(self.bottom_case_offset)
        bottom_case_shell = bottom_case_box.faces("<Z").shell(case_wall_thickness, kind="intersection")

        bottom_case_shell = bottom_case_shell.union(extrude_part_faces("<Z", bottom_case_shell, 8, faces_selector=">Z[-2]"))

        # cut out holes and parts
        bottom_case_shell = bottom_case_shell.cut(self.union_of_bounding_boxes)
        for part in self.part_list.parts:
            if part.hole_cq_object is not None:
                bottom_case_shell = bottom_case_shell.cut(part.hole_cq_object)
        return bottom_case_shell
