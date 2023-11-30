import cadquery as cq
from ocp_vscode import show_object
from typing import Literal, List


def generate_compartment_door(compartment_door_dimensions: cq.Vector = (50, 60, 1.5),
                              fitting_arm_thickness: float = 1.5,
                              fitting_arm_height: float = 10,
                              fitting_arm_width: float = 8,
                              tab_dimension: cq.Vector = (3, 3),
                              snap_joint_face_selectors: List[Literal["+Y", "-Y", "+X", "-X"]] = [
                                  "+Y"],
                              tabs_face_selector: Literal["<Y", ">Y", "<X", ">X"] = "<Y") -> cq.Workplane:
    """
    Generates a compartment door with snap joints and tabs
    :param compartment_door_dimensions: The dimensions of the compartment door, meaning the width, height and thickness excluding the fitting arm and tabs
    :param fitting_arm_thickness: The thickness of the fitting arm. Thicker means thicker snap joints and more tension
    :param fitting_arm_height: How deep the fitting arm goes into the case. Higher (meaning deeper) means more suspension
    :param fitting_arm_width: How wide the fitting arm is. It is not recommended to have this value be greater than the width of the compartment door
    :param tab_dimension: The dimensions of the tabs, meaning the width and height. Half of the height will be below the compartment door and the other half will stick out
                          The thickness of the tabs is the same as the thickness of the compartment door
    :param snap_joint_face_selectors: The face selectors of the faces of the compartment door where the snap joints should be placed. Uses the cadquery face selectors (eg. +Y means the face on the positive y axis)
                                      Multiple face selectors can be used by passing a list of face selectors
    :param tabs_face_selector: The face selector of the face of the compartment door where the tabs should be placed. Only one face can be selected. Uses the cadquery face selectors (eg. >Y means the face on the positive y axis)
                               Should be placed on the opposite side of the snap joints
    :return: The compartment door as a cadquery Workplane

    Example:

    .. code-block:: python
    
            from ocp_vscode import show_object
            from compartment_door import generate_compartment_door
    
            show_object(generate_compartment_door())
    """

    snap_joint_face_selector = " or ".join(snap_joint_face_selectors)

    return (cq.Workplane("XY").box(compartment_door_dimensions[0], compartment_door_dimensions[1], compartment_door_dimensions[2])
            .faces(snap_joint_face_selector)
            .each(
        lambda cq_object: cq.Workplane(cq_object)
        # fitting_arm
        .workplane()
        .transformed(offset=(0, 0.5 * compartment_door_dimensions[2], 0), rotate=(0, -90, 0))
        .line(fitting_arm_thickness, 0)
        .line(0.5, -fitting_arm_height + 1.5 * fitting_arm_thickness)
        .threePointArc((2 * fitting_arm_thickness + 0.5, -fitting_arm_height + fitting_arm_thickness), (3 * fitting_arm_thickness, -fitting_arm_height + 1.5 * fitting_arm_thickness))
        .line(0.5, +fitting_arm_height - 1.5 * fitting_arm_thickness)
        .line(fitting_arm_thickness, 0)
        .line(-0.5, -fitting_arm_height + 1.5 * fitting_arm_thickness)
        .threePointArc((2 * fitting_arm_thickness + 0.5, -fitting_arm_height), (0.5, -fitting_arm_height + 1.5 * fitting_arm_thickness))
        .lineTo(0, -compartment_door_dimensions[2])
        .lineTo(0, 0)
        .close()
        .extrude(fitting_arm_width, both=True)
        # fitting_arm_hole
        .transformed(rotate=(90, 0, 0))
        .moveTo(3.5 * fitting_arm_thickness + 1, 0)
        .rect(fitting_arm_width/1.5, fitting_arm_width)
        .cutBlind(fitting_arm_height / 3)
        # fitting_arm_snap_joint
        .center(3 * fitting_arm_thickness + 0.5, 0)
        .move(0, -fitting_arm_width/2)
        .line(0, -fitting_arm_thickness)
        .line(1.5*fitting_arm_thickness, 0)
        .threePointArc((2.5*fitting_arm_thickness, 0), (1.5*fitting_arm_thickness, fitting_arm_width/2 + fitting_arm_thickness))
        .line(-1.5*fitting_arm_thickness, 0)
        .line(0, -fitting_arm_thickness)
        .line(fitting_arm_thickness, 0)
        .threePointArc((1.5 * fitting_arm_thickness, 0), (fitting_arm_thickness, -fitting_arm_width/2))
        .line(-fitting_arm_thickness, 0)
        .close()
        .extrude(fitting_arm_thickness).val(),
        combine="a"
    )
        # tabs
        .faces(tabs_face_selector)
        .workplane()
        .moveTo(-compartment_door_dimensions[0] / 4, -compartment_door_dimensions[2])
        .line(compartment_door_dimensions[0] / 2, 0, forConstruction=True)
        .vertices()
        .rect(tab_dimension[0], fitting_arm_thickness)
        .extrude(tab_dimension[1], both=True)
    )


show_object(generate_compartment_door(snap_joint_face_selectors=["+X", "-X"], tabs_face_selector="<Y"))
