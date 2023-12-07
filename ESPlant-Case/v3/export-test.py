import ocp_vscode
import cadquery as cq
from typing import List
from compartment_door import CompartmentDoor, CompartmentDoorSettings
from battery_holder import BatteryHolder, BatteryHolderSettings
from casemaker import Casemaker

parts = {}

# Compartment Door
compartment_door_settings: List[CompartmentDoorSettings] = [
    CompartmentDoorSettings(compartment_door_dimensions=(20, 20, 1.5), snap_joint_face_selectors=[
                            "+X", "-X", "+Y"], tabs_face_selector="<Y"),
    CompartmentDoorSettings(compartment_door_dimensions=(
        24, 20, 1.5), fitting_arm_angle_offset=0),
    CompartmentDoorSettings(compartment_door_dimensions=(20, 20, 1.5), snap_joint_face_selectors=[
                            "+X", "-X", "+Y", "-Y"], tabs_face_selector=""),
    CompartmentDoorSettings(compartment_door_dimensions=(
        20, 20, 1.5), fitting_arm_thickness=2, fitting_arm_height=12, compartment_door_tolerance=0.1),
    CompartmentDoorSettings(compartment_door_dimensions=(
        20, 20, 1.5), tab_dimension=(3, 4), tab_spacing_factor=0.6, tab_tolerance=0.1),
    CompartmentDoorSettings(compartment_door_dimensions=(
        20, 20, 1.5), fitting_arm_distance_factor=3, fitting_arm_tolerance=0.1),
    # TODO fix fitting arm with different thickness
    # CompartmentDoorSettings(compartment_door_dimensions=(
    #     20, 20, 1.5), recessed_edge_width=0.5),
    # TODO fix recessed edge width
    # CompartmentDoorSettings(compartment_door_dimensions=(20, 20, 1.5), fitting_arm_thickness=0.5, fitting_arm_height=5, fitting_arm_width=10),
]

for i, settings in enumerate(compartment_door_settings):
    settings.frame_text = str(i)
    settings.compartment_door_text = str(i)
    compartment_door = CompartmentDoor(settings)
    compartment_door_filename = f"compartment_door_{i}.step"
    compartment_door_frame_with_walls_filename = f"compartment_door_frame_with_walls_{i}.step"
    compartment_door.door = compartment_door.door.mirror("XY")
    cq.Assembly(compartment_door.door).save(compartment_door_filename)
    cq.Assembly(compartment_door.compartment_door_frame_with_walls).save(
        compartment_door_frame_with_walls_filename)
    parts |= {
        f"compartment_door_{i}": compartment_door.door,
        f"compartment_door_frame_with_walls_{i}": compartment_door.compartment_door_frame_with_walls,
    }

compartment_door = CompartmentDoor(
    CompartmentDoorSettings(compartment_door_text="sideways"))
compartment_door.door = compartment_door.door.rotate(
    (0, 0, 0), (0, 1, 0), 90)
cq.Assembly(compartment_door.door).save("compartment_door_sideways.step")
parts |= {
    "compartment_door_sideways": compartment_door.door,
}

# Battery Holder
battery_holder_settings: List[BatteryHolderSettings] = [
    BatteryHolderSettings(),
]

for i, settings in enumerate(battery_holder_settings):
    settings.center_text = str(i)
    battery_holder = BatteryHolder(settings)
    battery_holder_filename = f"battery_holder_{i}.step"
    cq.Assembly(battery_holder.battery_holder).save(
        battery_holder_filename)
    parts |= {
        f"battery_holder_{i}": battery_holder.battery_holder,
    }

# Casemaker
casemaker = Casemaker()
casemaker.battery_holder.battery_holder = casemaker.battery_holder.battery_holder.mirror("XY")
casemaker.bottom_case_cq_object = casemaker.bottom_case_cq_object.mirror("XY")
cq.Assembly(casemaker.bottom_case_cq_object).save("Case-Bottom.step")
cq.Assembly(casemaker.compartment_door.door).save("Compartment-Door.step")
cq.Assembly(casemaker.battery_holder.battery_holder).save("Battery-Holder.step")
cq.Assembly(casemaker.case_preview).save("Case-preview-DO-NOT-PRINT.step")

parts |= {
    "Case-Bottom": casemaker.bottom_case_cq_object,
    "Compartment-Door": casemaker.compartment_door.door,
    "Battery-Holder": casemaker.battery_holder.battery_holder,
    "Case-preview-DO-NOT-PRINT": casemaker.case_preview,
}


total_translation = 0
for name, part in parts.items():
    part: cq.Workplane = part
    total_translation += part.val().BoundingBox().xlen / 2
    ocp_vscode.show_object(part.translate((total_translation, 0, 0)), name)
    total_translation += part.val().BoundingBox().xlen / 2
