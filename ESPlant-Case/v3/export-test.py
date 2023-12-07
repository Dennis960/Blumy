if __name__ == "__main__":
    import ocp_vscode
    import cadquery as cq
    from typing import List
    from compartment_door import CompartmentDoor, CompartmentDoorSettings, CompartmentDoorTolerances
    from battery_holder import BatteryHolder, BatteryHolderSettings, BatteryHolderTolerances

    parts = []

    list_of_settings: List[CompartmentDoorSettings] = [
        CompartmentDoorSettings(compartment_door_dimensions=(20, 20, 1.5), snap_joint_face_selectors=[
                                "+X", "-X", "+Y"], tabs_face_selector="<Y"),
        CompartmentDoorSettings(compartment_door_dimensions=(
            24, 20, 1.5), fitting_arm_angle_offset=0),
        CompartmentDoorSettings(compartment_door_dimensions=(20, 20, 1.5), snap_joint_face_selectors=[
                                "+X", "-X", "+Y", "-Y"], tabs_face_selector=""),
        CompartmentDoorSettings(compartment_door_dimensions=(
            20, 20, 1.5), fitting_arm_thickness=2, fitting_arm_height=12),
        CompartmentDoorSettings(compartment_door_dimensions=(
            20, 20, 1.5), tab_dimension=(3, 4), tab_spacing_factor=0.6),
        CompartmentDoorSettings(compartment_door_dimensions=(
            20, 20, 1.5), fitting_arm_distance_factor=3),
        # TODO fix fitting arm with different thickness
        # CompartmentDoorSettings(compartment_door_dimensions=(
        #     20, 20, 1.5), recessed_edge_width=0.5),
        # TODO fix recessed edge width
        # CompartmentDoorSettings(compartment_door_dimensions=(20, 20, 1.5), fitting_arm_thickness=0.5, fitting_arm_height=5, fitting_arm_width=10),
    ]
    list_of_tolerances: List[CompartmentDoorTolerances] = [
        CompartmentDoorTolerances(),
        CompartmentDoorTolerances(),
        CompartmentDoorTolerances(),
        CompartmentDoorTolerances(compartment_door_tolerance=0.1),
        CompartmentDoorTolerances(tab_tolerance=0.1),
        CompartmentDoorTolerances(fitting_arm_tolerance=0.1),
        # TODO fix recessed edge width
        # TODO fix fitting arm with different thickness
        # CompartmentDoorTolerances()
    ]

    for i, (settings, tolerances) in enumerate(zip(list_of_settings, list_of_tolerances)):
        settings.frame_text = str(i)
        settings.compartment_door_text = str(i)
        compartment_door = CompartmentDoor(settings, tolerances)
        compartment_door_filename = f"compartment_door_{i}.step"
        compartment_door_frame_with_walls_filename = f"compartment_door_frame_with_walls_{i}.step"
        cq.Assembly(compartment_door.door.mirror("XY")
                    ).save(compartment_door_filename)
        cq.Assembly(compartment_door.compartment_door_frame_with_walls).save(
            compartment_door_frame_with_walls_filename)
        parts.append({
            f"compartment_door_{i}": compartment_door.door,
            f"compartment_door_frame_with_walls_{i}": compartment_door.compartment_door_frame_with_walls,
        })

    compartment_door = CompartmentDoor(CompartmentDoorSettings(compartment_door_text="sideways"))
    compartment_door.door = compartment_door.door.rotate((0, 0, 0), (0, 1, 0), 90)
    cq.Assembly(compartment_door.door).save("compartment_door_sideways.step")

    # Battery Holder
    list_of_settings: List[BatteryHolderSettings] = [
        BatteryHolderSettings(),
    ]
    list_of_tolerances: List[BatteryHolderTolerances] = [
        BatteryHolderTolerances(),
    ]

    for i, (settings, tolerances) in enumerate(zip(list_of_settings, list_of_tolerances)):
        settings.center_text = str(i)
        battery_holder = BatteryHolder(settings, tolerances)
        battery_holder_filename = f"battery_holder_{i}.step"
        cq.Assembly(battery_holder.battery_holder).save(battery_holder_filename)
        parts.append({
            f"battery_holder_{i}": battery_holder.battery_holder,
        })

    ocp_vscode.show_all(parts)