import cadquery as cq
from settings import CompartmentDoorSettings


class CompartmentDoor:
    def __init__(self, settings: CompartmentDoorSettings = CompartmentDoorSettings()):
        self.settings = settings
        self.door_cq_object = self.generate_compartment_door()
        self.door_with_tolerance = self.generate_compartment_door_with_tolerance()
        self.frame_cq_object = self.generate_compartment_door_frame()
        self.compartment_door_frame_walls = self.generate_compartment_door_frame_walls()
        self.compartment_door_frame_with_walls = self.frame_cq_object.union(
            self.compartment_door_frame_walls)

    def _generate_fitting_arm(self, face: cq.Workplane) -> cq.Workplane:
        s = self.settings
        angle_part_height = s.fitting_arm_height - 1.5 * s.fitting_arm_thickness
        ratio = s.fitting_arm_angle_offset / angle_part_height
        return (cq.Workplane(face)
                .workplane()
                .transformed(rotate=(0, -90, 0))
                .center(0, 0.5 * s.compartment_door_dimensions.z)
                .line(s.fitting_arm_thickness, 0)
                .line(s.fitting_arm_angle_offset, -s.fitting_arm_height + s.fitting_arm_thickness + 0.5 * s.fitting_arm_thickness)
                .threePointArc(
                (0.5 * s.fitting_arm_distance_factor*s.fitting_arm_thickness + s.fitting_arm_thickness +
                 s.fitting_arm_angle_offset, -s.fitting_arm_height + s.fitting_arm_thickness),
                (s.fitting_arm_distance_factor*s.fitting_arm_thickness + s.fitting_arm_thickness + s.fitting_arm_angle_offset, -s.fitting_arm_height + s.fitting_arm_thickness + 0.5 * s.fitting_arm_thickness))
                .line(s.fitting_arm_angle_offset, s.fitting_arm_height - s.fitting_arm_thickness - 0.5 * s.fitting_arm_thickness)
                .line(s.fitting_arm_thickness, 0)
                .line(-ratio * s.fitting_arm_angle_offset, -2 * s.fitting_arm_thickness - s.fitting_arm_tolerance)
                # triangle (overhang) start
                .line(s.snap_joint_overhang, 0)
                .line(-s.snap_joint_overhang - ratio * s.fitting_arm_thickness, -s.fitting_arm_thickness)
                # triangle end
                .line((-s.fitting_arm_height + 4.5 * s.fitting_arm_thickness) * ratio, -s.fitting_arm_height + 4.5 * s.fitting_arm_thickness + s.fitting_arm_tolerance)
                .threePointArc((0.5 * s.fitting_arm_distance_factor*s.fitting_arm_thickness + s.fitting_arm_thickness + s.fitting_arm_angle_offset, -s.fitting_arm_height), (s.fitting_arm_angle_offset, -s.fitting_arm_height + s.fitting_arm_thickness + 0.5 * s.fitting_arm_thickness))
                .lineTo(0, -s.fitting_arm_thickness)
                .lineTo(0, 0)
                .close()
                .tag("fitting_arm_wire")
                .extrude(0.5 * s.fitting_arm_width, both=True)
                .tag("fitting_arm")
                .transformed(rotate=(-90, 0, 0))
                .faces("+Z", tag="fitting_arm")
                .last()
                .center(s.fitting_arm_thickness + s.fitting_arm_angle_offset + s.fitting_arm_distance_factor * s.fitting_arm_thickness, 0)
                .rect(s.fitting_arm_thickness + s.fitting_arm_angle_offset, 0.5 * s.fitting_arm_width, centered=(False, True))
                .cutBlind(-2 * s.fitting_arm_thickness)
                .workplaneFromTagged("fitting_arm")
                .transformed(rotate=(-90, 0, 0))
                .faces("+Z", tag="fitting_arm")
                .last()
                .center(2 * s.fitting_arm_angle_offset + (2 + s.fitting_arm_distance_factor) * s.fitting_arm_thickness, 0)
                .move(0, 0.25 * s.fitting_arm_width)
                .line(0, s.fitting_arm_thickness)
                .threePointArc((3 * s.fitting_arm_thickness, 0), (0, -0.25 * s.fitting_arm_width - s.fitting_arm_thickness))
                .line(0, s.fitting_arm_thickness)
                .threePointArc((2 * s.fitting_arm_thickness, 0), (0, 0.25 * s.fitting_arm_width))
                .close()
                .tag("snap_joint_wires")
                .extrude(-s.fitting_arm_thickness)
                )

    def _generate_fitting_arm_tolerance(self, face: cq.Workplane) -> cq.Workplane:
        s = self.settings
        return (self._generate_fitting_arm(face)
                .workplaneFromTagged("fitting_arm_wire")
                .wires(tag="fitting_arm_wire")
                .toPending()
                .offset2D(s.fitting_arm_tolerance, "intersection")
                .extrude(0.5 * s.fitting_arm_width + s.fitting_arm_tolerance, both=True)
                .tag("fitting_arm_with_tolerance")
                .faces("+Z", tag="fitting_arm_with_tolerance")
                .first()
                .transformed(offset=(0, s.fitting_arm_tolerance, 0), rotate=(-90, 0, 0))
                .rect((1 + s.fitting_arm_distance_factor) * s.fitting_arm_thickness + 2 * s.fitting_arm_angle_offset, s.fitting_arm_width + 2 * s.fitting_arm_tolerance, centered=(False, True))
                .extrude("last")
                .tag("fitting_arm_with_tolerance")
                .wires(tag="snap_joint_wires")
                .toPending()
                .offset2D(s.fitting_arm_tolerance, "intersection")
                .tag("snap_joint_wires")
                .extrude(-s.fitting_arm_thickness)
                .wires(tag="snap_joint_wires")
                .toPending()
                .extrude(s.fitting_arm_tolerance)
                )

    def generate_compartment_door(self) -> cq.Workplane:
        s = self.settings
        compartment_door = (cq.Workplane("XY")
                            .box(s.compartment_door_dimensions.x - 2 * s.compartment_door_tolerance,
                                 s.compartment_door_dimensions.y - 2 * s.compartment_door_tolerance, s.compartment_door_dimensions.z)
                            .tag("compartment_door")
                            .faces(s.snap_joint_face_selector, tag="compartment_door")
                            .each(lambda face: self._generate_fitting_arm(face).val(), combine="a")
                            )
        if s.tabs_face_selector:
            compartment_door = (compartment_door
                                .faces(s.tabs_face_selector, tag="compartment_door")
                                .workplane()
                                .move(-0.5 * s.tab_spacing_factor * s.compartment_door_dimensions.x, -1.5 * s.compartment_door_dimensions.z)
                                .line(s.tab_spacing_factor * s.compartment_door_dimensions.x, 0, forConstruction=True)
                                .vertices()
                                .tag("tab_points")
                                .box(s.tab_dimension.x, s.compartment_door_dimensions.z, s.tab_dimension.y, centered=(True, False, True))
                                )
        if s.compartment_door_text:
            compartment_door = (compartment_door
                                .faces("-Z")
                                .first()
                                .workplane(centerOption="CenterOfBoundBox")
                                .text(s.compartment_door_text, s.text_size, -s.text_thickness, combine="c")
                                )
        return compartment_door

    def generate_compartment_door_with_tolerance(self) -> cq.Workplane:
        s = self.settings
        compartment_door = (self.generate_compartment_door()
                            .workplaneFromTagged("compartment_door")
                            .box(s.compartment_door_dimensions.x, s.compartment_door_dimensions.y, s.compartment_door_dimensions.z)
                            .tag("compartment_door_with_tolerance")
                            .faces(s.snap_joint_face_selector, tag="compartment_door")
                            .each(lambda face: self._generate_fitting_arm_tolerance(face).val(), combine="a")
                            )
        if s.tabs_face_selector:
            compartment_door = (compartment_door
                                .workplaneFromTagged("tab_points")
                                .vertices(tag="tab_points")
                                .translate((0, 0, -s.tab_tolerance))
                                .box(s.tab_dimension.x + 2 * s.tab_tolerance, s.compartment_door_dimensions.z + 2 * s.tab_tolerance, s.tab_dimension.y + 2 * s.tab_tolerance, centered=(True, False, True))
                                )
        return compartment_door

    def _generate_fitting_arm_box(self, face: cq.cq.CQObject) -> cq.Workplane:
        s = self.settings
        fitting_arm_box_small = (cq.Workplane(face)
                                 .workplane()
                                 .transformed(offset=(0, -0.5 * s.compartment_door_dimensions.z, 0), rotate=(90, 0, 0))
                                 .box(s.fitting_arm_width + 2*s.fitting_arm_tolerance, (5 + s.fitting_arm_distance_factor) * s.fitting_arm_thickness + 2 * s.fitting_arm_angle_offset + s.fitting_arm_tolerance, s.fitting_arm_height + s.fitting_arm_tolerance - s.compartment_door_tolerance - s.compartment_door_dimensions.z, centered=(True, False, False))
                                 )
        return fitting_arm_box_small.union(
            fitting_arm_box_small.faces(
                "+Z").shell(s.fitting_arm_frame_thickness, kind="intersection")
        )

    def _generate_fitting_arm_boxes(self) -> cq.Workplane:
        s = self.settings
        fitting_arm_boxes = (cq.Workplane("XY")
                             .box(s.compartment_door_dimensions.x, s.compartment_door_dimensions.y, s.compartment_door_dimensions.z)
                             .faces(s.snap_joint_face_selector)
                             .each(lambda face: self._generate_fitting_arm_box(face).val(), combine="a")
                             )
        if s.frame_text:
            fitting_arm_boxes = (fitting_arm_boxes
                                 .faces("-Z")
                                 .last()
                                 .workplane(centerOption="CenterOfBoundBox")
                                 .text(s.frame_text, s.frame_text_size, -s.text_thickness, combine="c")
                                 )
        return fitting_arm_boxes

    def _generate_recessed_edge(self) -> cq.Workplane:
        s = self.settings
        loft = (cq.Workplane("XY")
                .workplane(offset=-0.5 * s.compartment_door_dimensions.z)
                .rect(s.compartment_door_dimensions.x - 2 * s.recessed_edge_width, s.compartment_door_dimensions.y - 2 * s.recessed_edge_width)
                .workplane(offset=-s.recessed_edge_width)
                .rect(s.compartment_door_dimensions.x, s.compartment_door_dimensions.y)
                .loft(combine=True)
                )
        little_box = (cq.Workplane("XY")
                      .workplane(offset=-0.5 * s.compartment_door_dimensions.z)
                      .rect(s.compartment_door_dimensions.x - 2 * s.recessed_edge_width, s.compartment_door_dimensions.y - 2 * s.recessed_edge_width)
                      .extrude(-s.recessed_edge_width)
                      )
        big_box = (cq.Workplane("XY")
                   .workplane(offset=-0.5 * s.compartment_door_dimensions.z)
                   .rect(s.compartment_door_dimensions.x, s.compartment_door_dimensions.y)
                   .extrude(-s.compartment_door_dimensions.z)
                   )
        ring = big_box.cut(little_box)
        return ring.cut(loft)

    def generate_compartment_door_frame(self) -> cq.Workplane:
        recessed_edge = self._generate_recessed_edge()
        fitting_arm_boxes = self._generate_fitting_arm_boxes()
        return recessed_edge.union(fitting_arm_boxes).cut(self.door_with_tolerance)

    def translate(self, vec: cq.Vector = cq.Vector(0, 0, 0)) -> None:
        self.door_cq_object = self.door_cq_object.translate(vec)
        self.door_with_tolerance = self.door_with_tolerance.translate(vec)
        self.frame_cq_object = self.frame_cq_object.translate(vec)

    def rotate(self, axisStart: cq.Vector = cq.Vector(0, 0, 0), axisEnd: cq.Vector = cq.Vector(0, 0, 0), angleDegrees: float = 0) -> None:
        self.door_cq_object = self.door_cq_object.rotate(
            axisStart, axisEnd, angleDegrees)
        self.door_with_tolerance = self.door_with_tolerance.rotate(
            axisStart, axisEnd, angleDegrees)
        self.frame_cq_object = self.frame_cq_object.rotate(axisStart, axisEnd, angleDegrees)

    def generate_compartment_door_frame_walls(self) -> cq.Workplane:
        """
        This method is used to test the compartment door frame without printing an entire case
        """
        s = self.settings
        return (cq.Workplane("XY")
                .transformed(offset=(0, 0, 0.5 * s.compartment_door_dimensions.z))
                .rect(s.compartment_door_dimensions.x, s.compartment_door_dimensions.y)
                .extrude(-s.fitting_arm_height - s.fitting_arm_tolerance - s.fitting_arm_frame_thickness + s.compartment_door_tolerance)
                .faces("|Z")
                .shell(s.recessed_edge_width, kind="intersection")
                .cut(self.door_with_tolerance)
                )


if __name__ == "__main__":
    import ocp_vscode

    compartment_door = CompartmentDoor()
    ocp_vscode.show_all({
        "compartment_door": compartment_door.door_cq_object,
        "compartment_door_frame_with_walls": compartment_door.compartment_door_frame_with_walls,
        "compartment_door_frame": compartment_door.frame_cq_object
    })
