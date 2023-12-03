import cadquery as cq
from typing import Literal, List
from dataclasses import dataclass, field


@dataclass
class CompartmentDoorSettings:
    """
    The settings for the compartment door
    :param compartment_door_dimensions: The dimensions of the compartment door, meaning the width, height and thickness including the fitting arm(s)
    :param fitting_arm_thickness: The thickness of the fitting arm. Thicker means thicker snap joints and more tension
    :param fitting_arm_height: How deep the fitting arm goes into the case. Higher (meaning deeper) means more suspension
    :param fitting_arm_width: How wide the fitting arm is. It is not recommended to have this value be greater than the width of the compartment door
    :param fitting_arm_distance_factor: TODO
    :param tab_dimension: The dimensions of the tabs, meaning the width and height. Half of the height will be below the compartment door and the other half will stick out
                          The thickness of the tabs is the same as the thickness of the compartment door
    :param snap_joint_face_selectors: The face selectors of the faces of the compartment door where the snap joints should be placed. Uses the cadquery face selectors (eg. +Y means the face on the positive y axis)
                                      Multiple face selectors can be used by passing a list of face selectors
    :param tabs_face_selector: The face selector of the face of the compartment door where the tabs should be placed. Only one face can be selected. Uses the cadquery face selectors (eg. >Y means the face on the positive y axis)
                               Should be placed on the opposite side of the snap joints
    """
    compartment_door_dimensions: cq.Vector = field(
        default_factory=lambda: cq.Vector(50, 60, 1.5))
    fitting_arm_thickness: float = 1.5
    fitting_arm_height: float = 10
    fitting_arm_width: float = 16
    fitting_arm_distance_factor: float = 2
    fitting_arm_angle_offset: float = 0.5
    tab_dimension: cq.Vector = (2, 3)
    tab_spacing_factor: float = 0.5
    snap_joint_overhang: float = 1
    snap_joint_face_selectors: List[Literal["+Y", "-Y",
                                            "+X", "-X"]] = field(default_factory=lambda: ["+Y"])
    tabs_face_selector: Literal["<Y", ">Y", "<X", ">X"] = "<Y"

    def __post_init__(self):
        self.snap_joint_face_selector = " or ".join(
            self.snap_joint_face_selectors)


@dataclass
class CompartmentDoorTolerances:
    """
    The tolerances for the compartment door
    :param tab_tolerance: The tolerance for the tabs. This is the amount of extra space where the tabs will be inserted
    :param fitting_arm_tolerance: The tolerance for the fitting arm. This is the amount of extra space (height and width) where the fitting arm will be inserted
    :param recessed_edge_width: The width of the recessed edge. This is the amount of extra space on which the compartment door will be placed to not have it stick out and not have it fall in
    :param recess_edge_depth: TODO: add description
    :param compartment_door_tolerance: The tolerance for the compartment door. This is the amount of extra space where the compartment door will be inserted
    """
    tab_tolerance: float = 0.5
    fitting_arm_tolerance: float = 0.5
    recessed_edge_width: float = 2
    recess_edge_depth: float = 5
    compartment_door_tolerance: float = 0.5


def generate_fitting_arm(settings: CompartmentDoorSettings, tolerances: CompartmentDoorTolerances, face: cq.Workplane) -> cq.Workplane:
    s = settings
    t = tolerances
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
            .line(-ratio * s.fitting_arm_angle_offset, -2 * s.fitting_arm_thickness - t.fitting_arm_tolerance)
            # triangle (overhang) start
            .line(s.snap_joint_overhang, 0)
            .line(-s.snap_joint_overhang - ratio * s.fitting_arm_thickness, -s.fitting_arm_thickness)
            # triangle end
            .line((-s.fitting_arm_height + 4.5 * s.fitting_arm_thickness) * ratio, -s.fitting_arm_height + 4.5 * s.fitting_arm_thickness + t.fitting_arm_tolerance)
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


def generate_fitting_arm_tolerance(settings: CompartmentDoorSettings, tolerances: CompartmentDoorTolerances, face: cq.Workplane) -> cq.Workplane:
    s = settings
    t = tolerances
    return (generate_fitting_arm(settings, tolerances, face)
            .workplaneFromTagged("fitting_arm_wire")
            .wires(tag="fitting_arm_wire")
            .toPending()
            .offset2D(t.fitting_arm_tolerance, "intersection")
            .extrude(0.5 * s.fitting_arm_width + t.fitting_arm_tolerance, both=True)
            .tag("fitting_arm_with_tolerance")
            .faces("+Z", tag="fitting_arm_with_tolerance")
            .first()
            .transformed(offset=(0, t.fitting_arm_tolerance, 0), rotate=(-90, 0, 0))
            .rect((1 + s.fitting_arm_distance_factor) * s.fitting_arm_thickness + 2 * s.fitting_arm_angle_offset, s.fitting_arm_width + 2 * t.fitting_arm_tolerance, centered=(False, True))
            .extrude("last")
            .tag("fitting_arm_with_tolerance")
            .wires(tag="snap_joint_wires")
            .toPending()
            .offset2D(t.fitting_arm_tolerance, "intersection")
            .tag("snap_joint_wires")
            .extrude(-s.fitting_arm_thickness)
            .wires(tag="snap_joint_wires")
            .toPending()
            .extrude(t.fitting_arm_tolerance)
            )


def generate_compartment_door(settings: CompartmentDoorSettings = CompartmentDoorSettings(), tolerances: CompartmentDoorTolerances = CompartmentDoorTolerances()) -> cq.Workplane:
    """
    Generates a compartment door with snap joints and tabs
    :param settings: The settings for the compartment door (see CompartmentDoorSettings for more information)
    :return: The compartment door as a cadquery Workplane

    Example:

    .. code-block:: python

            from ocp_vscode import show_object
            from compartment_door import generate_compartment_door, CompartmentDoorSettings

            show_object(generate_compartment_door(CompartmentDoorSettings()))
    """
    s = settings
    t = tolerances

    return (cq.Workplane("XY")
            .box(s.compartment_door_dimensions.x - 2 * t.compartment_door_tolerance,
                 s.compartment_door_dimensions.y - 2 * t.compartment_door_tolerance, s.compartment_door_dimensions.z)
            .tag("compartment_door")
            .faces(s.snap_joint_face_selector, tag="compartment_door")
            .each(lambda face: generate_fitting_arm(s, t, face).val(), combine="a")
            .faces(s.tabs_face_selector, tag="compartment_door")
            .workplane()
            .move(-0.5 * s.tab_spacing_factor * s.compartment_door_dimensions.x, -1.5 * s.compartment_door_dimensions.z)
            .line(s.tab_spacing_factor * s.compartment_door_dimensions.x, 0, forConstruction=True)
            .vertices()
            .tag("tab_points")
            .box(s.tab_dimension[0], s.compartment_door_dimensions.z, s.tab_dimension[1], centered=(True, False, True))
            )


def generate_compartment_door_with_tolerance(settings: CompartmentDoorSettings = CompartmentDoorSettings(), tolerances: CompartmentDoorTolerances = CompartmentDoorTolerances()) -> cq.Workplane:
    s = settings
    t = tolerances
    return (generate_compartment_door(settings, tolerances)
            .workplaneFromTagged("compartment_door")
            .box(s.compartment_door_dimensions.x, s.compartment_door_dimensions.y, s.compartment_door_dimensions.z)
            .tag("compartment_door_with_tolerance")
            .faces(s.snap_joint_face_selector, tag="compartment_door")
            .each(lambda face: generate_fitting_arm_tolerance(s, t, face).val(), combine="a")
            .workplaneFromTagged("tab_points")
            .vertices(tag="tab_points")
            .translate((0, 0, -t.tab_tolerance))
            .box(s.tab_dimension[0] + 2 * t.tab_tolerance, s.compartment_door_dimensions.z + 2 * t.tab_tolerance, s.tab_dimension[1] + 2 * t.tab_tolerance, centered=(True, False, True))
            )


if __name__ == "__main__":
    from ocp_vscode import show_object
    compartmentDoorSettings = CompartmentDoorSettings(
        snap_joint_face_selectors=["+X", "-X"], tabs_face_selector="<Y")
    compartmentDoorTolerances = CompartmentDoorTolerances()
    show_object(generate_compartment_door(
        compartmentDoorSettings), name="compartment_door")
    show_object(generate_compartment_door_with_tolerance(
        compartmentDoorSettings, compartmentDoorTolerances), name="compartment_door_with_tolerance")
