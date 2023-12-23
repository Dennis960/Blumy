from settings import *
from components import battery_springs


board_settings = BoardSettings(part_settings=[
    PartSetting(".*", ">Z", 0.5),
    PartSetting(".*", "<Z", 0.5),
    PartSetting(".*MICRO-USB.*", ">X",
                "Hole", width=11, height=6.5),
    PartSetting(".*SW-SMD_4P.*", ">Z", "Hole"),
    PartSetting(".*SW-SMD_MK.*", ">Z", "Hole",
                offset_y=-2.1, height=10),
    PartSetting(".*LED.*", ">Z", "Hole"),
    PartSetting(".*ALS-PT19.*", ">Z", "Hole"),
    PartSetting(".*ESP32.*", "<Z", 2),
    PartSetting(".*ESP32.*", ">Z", 2),
],
    parts_without_tolerances=["BatterySprings"],
    exclude=["PinHeader"]
)
case_settings = CaseSettings(
    case_dimension=("Auto", 62.5, 11),
    case_offset=(0, "Positive", "Positive")
)
compartment_door_settings = CompartmentDoorSettings(tab_spacing_factor=0.8)
battery_holder_settings = BatteryHolderSettings(
    front_wall_thickness=2.5,
    back_wall_thickness=1.5,
    insertable_springs_thickness=1,
    polartiy_text_spacing=0.3,
    battery_length_tolerance=0,
    offset=(0, -2.5, 0)
)

mounting_hole_diameter = 2.2

additional_parts = {
    "BatterySprings": battery_springs.val().wrapped,
}
