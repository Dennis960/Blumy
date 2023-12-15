from OCP.TopoDS import TopoDS_Shape
from functools import cache
import cadquery as cq
import re
from pcb import make_offset_shape
from utils import extrude_part_faces, extrude_part_width, extrude_part_height
from settings import BoardSettings, PCB_PART_NAME, case_hole_extrusion_size, PartSetting, SIDE
from typing import Literal

import logging


class Board:
    def __init__(self, board_shape: TopoDS_Shape, shapes_dict: dict[str, TopoDS_Shape], board_settings: BoardSettings = BoardSettings()):
        self.board_cq_object = cq.Workplane(cq.Shape.cast(board_shape))
        self._shapes_dict = shapes_dict
        self._cq_object_dict = {name: cq.Workplane(cq.Shape.cast(
            shape)) for name, shape in self._shapes_dict.items()}
        self.pcb_cq_object = self._cq_object_dict[self._find_all_names_by_name_regex(
            board_settings.pcb_part_name)[0]]
        self._bounding_box_dict = {name: cq.Shape.cast(
            shape).BoundingBox() for name, shape in self._shapes_dict.items()}
        self._bounding_box_cq_object_dict = self._convert_bounding_box_dict_to_bounding_box_cq_object_dict(
            self._bounding_box_dict)
        self.settings = board_settings
        self.settings.part_settings = self._move_hole_settings_to_end(
            self.settings.part_settings)
        self._pcb_cq_object_with_tolerance = self.get_pcb_cq_object_with_tolerance()
        self._cq_object_with_part_tolerance_dict = self._get_cq_object_with_part_tolerance_dict()
        self._cq_object_with_part_tolerance_and_applied_settings_dict, self._hole_dict = self._apply_settings_to_cq_object_with_part_tolerance_dict()

    @cache
    def get_cq_objects_with_tolerances_union(self):
        """
        Returns a cq object that can be cut out of the case to make space for the board and components with their tolerances
        """
        logging.info("Creating cq objects with tolerances union")
        cq_objects_with_tolerances_union = cq.Workplane("XY")
        for cq_object_with_part_tolerance in self._cq_object_with_part_tolerance_and_applied_settings_dict.values():
            cq_objects_with_tolerances_union = cq_objects_with_tolerances_union.union(
                cq_object_with_part_tolerance)
        return cq_objects_with_tolerances_union

    @cache
    def get_holes_union(self):
        """
        Returns a cq object that can be cut out of the case to create the holes
        """
        logging.info("Creating holes union")
        holes_union = cq.Workplane("XY")
        for hole_cq_object in self._hole_dict.values():
            holes_union = holes_union.union(hole_cq_object)
        return holes_union

    @cache
    def get_pcb_thickness(self):
        """
        Returns the thickness of the pcb
        """
        logging.info("Getting pcb thickness")
        return self.pcb_cq_object.val().BoundingBox().zlen

    @cache
    def get_pcb_with_tolerance_thickness(self):
        """
        Returns the thickness of the pcb with the tolerance applied
        """
        logging.info("Getting pcb with tolerance thickness")
        return self._pcb_cq_object_with_tolerance.val().BoundingBox().zlen

    def _find_all_cq_objects_by_name_regex(self, regex: str):
        logging.info(f"Finding all cq objects by name regex: {regex}")
        return [cq_object for name, cq_object in self._cq_object_dict.items() if re.match(f".*{regex}.*", name)]

    def _find_all_names_by_name_regex(self, regex: str):
        logging.info(f"Finding all names by name regex: {regex}")
        return [name for name in self._shapes_dict.keys() if re.match(f".*{regex}.*", name)]

    def _move_hole_settings_to_end(self, part_settings: list[PartSetting]):
        logging.info("Moving hole settings to end")
        offset = 0
        for i in range(len(part_settings)):
            if part_settings[i + offset].length == "Hole":
                part_settings.append(part_settings.pop(i + offset))
                offset -= 1
        return part_settings

    @cache
    def get_pcb_extrusion(self, side: Literal[SIDE.TOP, SIDE.BOTTOM]):
        """
        Returns a cq object that can be cut out of the case to make space for inserting the pcb
        """
        return extrude_part_faces(self._pcb_cq_object_with_tolerance, side.value, case_hole_extrusion_size)

    def _get_cq_object_with_part_tolerance_dict(self) -> dict[str, cq.Workplane]:
        logging.info("Getting cq object with part tolerance dict")
        s = self.settings
        cq_object_with_tolerance_dict = {}
        for name in self._shapes_dict.keys():
            if PCB_PART_NAME in name:
                cq_object_with_tolerance = self._pcb_cq_object_with_tolerance
            else:
                bounding_box_cq_object = self._bounding_box_cq_object_dict[name]
                cq_object_with_tolerance = bounding_box_cq_object.union(
                    bounding_box_cq_object.faces("<Z").shell(
                        s.part_tolerance, kind="intersection"
                    )
                )
            cq_object_with_tolerance_dict[name] = cq_object_with_tolerance
        return cq_object_with_tolerance_dict

    @cache
    def get_pcb_cq_object_with_tolerance(self):
        """
        Returns the pcb cq object with the tolerance applied
        """
        logging.info("Getting pcb cq object with tolerance")
        s = self.settings
        return make_offset_shape(
            self.pcb_cq_object,
            s.pcb_tolerance
        )

    def _apply_settings_to_cq_object_with_part_tolerance_dict(self) -> tuple[dict[str, cq.Workplane], dict[str, cq.Workplane]]:
        logging.info(
            "Applying settings to cq object with part tolerance dict")
        cq_object_with_part_tolerance_dict = self._cq_object_with_part_tolerance_dict.copy()
        hole_cq_objects_dict: dict[str, cq.Workplane] = {}
        for part_setting in self.settings.part_settings:
            names = self._find_all_names_by_name_regex(part_setting.name_regex)
            for name in names:
                cq_object_with_applied_setting = cq_object_with_part_tolerance_dict[name]
                if part_setting.length != "Hole":
                    logging.info(
                        f"Applying setting to {name}: {part_setting}")
                    cq_object_with_applied_setting = self._apply_setting_to_cq_object(
                        cq_object_with_applied_setting, part_setting)
                    cq_object_with_part_tolerance_dict[name] = cq_object_with_applied_setting
                else:
                    if name not in hole_cq_objects_dict:
                        hole_cq_objects_dict[name] = cq.Workplane("XY")
                    hole_cq_object = hole_cq_objects_dict[name]
                    hole_cq_object = hole_cq_object.union(
                        self._apply_setting_to_cq_object(
                            cq_object_with_applied_setting, part_setting)
                    )
                    hole_cq_objects_dict[name] = hole_cq_object
        return cq_object_with_part_tolerance_dict, hole_cq_objects_dict

    def _apply_setting_to_cq_object(self, cq_object: cq.Workplane, part_setting: PartSetting):
        logging.info(f"Applying setting to cq object: {part_setting}")
        is_hole_extrusion = part_setting.length == "Hole"
        extrude_len = (
            case_hole_extrusion_size if is_hole_extrusion else part_setting.length
        )
        extrusion = extrude_part_faces(
            cq_object, part_setting.top_direction, extrude_len
        )
        if part_setting.width != "Auto":
            extrusion = extrude_part_width(
                extrusion, part_setting.width, part_setting.top_direction
            )
        if part_setting.height != "Auto":
            extrusion = extrude_part_height(
                extrusion, part_setting.height, part_setting.top_direction
            )
        extrusion = extrusion.translate(
            (part_setting.offset_x, part_setting.offset_y, part_setting.offset_z)
        )
        if is_hole_extrusion:
            extrusion = cq_object.union(extrusion)
        else:
            extrusion = cq_object.union(extrusion)
        return extrusion

    def _convert_bounding_box_dict_to_bounding_box_cq_object_dict(self, bounding_box_dict: dict[str, cq.BoundBox]) -> dict[str, cq.Workplane]:
        logging.info(
            "Converting bounding box dict to bounding box cq object dict")
        return {name:
                cq.Workplane("XY").box(
                    bounding_box.xlen,
                    bounding_box.ylen,
                    bounding_box.zlen
                ).translate((
                    bounding_box.center.x,
                    bounding_box.center.y,
                    bounding_box.center.z
                ))
                for name, bounding_box in bounding_box_dict.items()
                }
