import ocp_vscode
import cadquery as cq
from compartment_door import CompartmentDoor
from battery_holder import BatteryHolder
from casemaker import CasemakerLoader
from settings import SIDE, CompartmentDoorSettings, BatteryHolderSettings, CaseSettings
from components import battery_springs

export_file_extension = ".step"

parts = {}

# Compartment Door
compartment_door_settings: list[CompartmentDoorSettings] = [
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
    compartment_door_filename = f"compartment_door_{i}{export_file_extension}"
    compartment_door_frame_with_walls_filename = f"compartment_door_frame_with_walls_{i}{export_file_extension}"
    compartment_door.door_cq_object = compartment_door.door_cq_object.mirror(
        "XY")
    cq.Assembly(compartment_door.door_cq_object).save(
        compartment_door_filename)
    cq.Assembly(compartment_door.compartment_door_frame_with_walls).save(
        compartment_door_frame_with_walls_filename)
    parts |= {
        f"compartment_door_{i}": compartment_door.door_cq_object,
        f"compartment_door_frame_with_walls_{i}": compartment_door.compartment_door_frame_with_walls,
    }

compartment_door = CompartmentDoor(
    CompartmentDoorSettings(compartment_door_text="sideways"))
compartment_door.door_cq_object = compartment_door.door_cq_object.rotate(
    (0, 0, 0), (0, 1, 0), 90)
cq.Assembly(compartment_door.door_cq_object).save(
    f"compartment_door_sideways{export_file_extension}")
parts |= {
    "compartment_door_sideways": compartment_door.door_cq_object,
}

# Battery Holder
battery_holder_settings: list[BatteryHolderSettings] = [
    BatteryHolderSettings(),
    BatteryHolderSettings(battery_length_tolerance=3),
    BatteryHolderSettings(battery_length_tolerance=0),
    BatteryHolderSettings(number_of_batteries=1),
    BatteryHolderSettings(number_of_batteries=8),
]

for i, settings in enumerate(battery_holder_settings):
    settings.center_text = str(i)
    battery_holder = BatteryHolder(settings)
    battery_holder_filename = f"battery_holder_{i}{export_file_extension}"
    cq.Assembly(battery_holder.battery_holder_cq_object).save(
        battery_holder_filename)
    parts |= {
        f"battery_holder_{i}": battery_holder.battery_holder_cq_object,
    }

casemaker = (CasemakerLoader()
             .load_additional_parts({
                 "BatterySprings": battery_springs.val().wrapped,
             })
             .exclude_parts("PinHeader")
             .load_kicad_pcb("ESPlant-Board/ESPlant-Board.kicad_pcb")
             .generate_board()
             .generate_case(CaseSettings(
                 case_dimension=("Auto", 62, 12),
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
             )
casemaker.battery_holder.battery_holder = casemaker.battery_holder.battery_holder.mirror(
    "XY")
casemaker.case.case_cq_object = casemaker.case.case_cq_object.mirror("XY")
cq.Assembly(casemaker.case.case_cq_object).save(
    f"Case-Bottom{export_file_extension}")
cq.Assembly(casemaker.compartment_door.door).save(
    f"Compartment-Door{export_file_extension}")
cq.Assembly(casemaker.battery_holder.battery_holder).save(
    f"Battery-Holder{export_file_extension}")

parts |= {
    "Case-Bottom": casemaker.case.case_cq_object,
    "Compartment-Door": casemaker.compartment_door.door,
    "Battery-Holder": casemaker.battery_holder.battery_holder,
}


total_translation = 0
for name, part in parts.items():
    part: cq.Workplane = part
    total_translation += part.val().BoundingBox().xlen / 2
    ocp_vscode.show_object(part.translate((total_translation, 0, 0)), name)
    total_translation += part.val().BoundingBox().xlen / 2
