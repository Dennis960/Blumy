import cadquery as cq
from dataclasses import dataclass
from enum import Enum


# TODO Future improvements:
# Selectable battery types (AA, AAA)

@dataclass
class BatteryHolderSettings:
    battery_diameter: float = 10.5
    battery_length: float = 44.5
    number_of_batteries: int = 2

    floor_thickness: float = 1.5

    outer_wall_height: float = 8
    outer_wall_thickness: float = 1.5
    inner_wall_height: float = 5
    inner_wall_thickness: float = 1.5
    front_wall_height: float = 11
    front_wall_thickness: float = 5
    back_wall_height: float = 11
    back_wall_thickness: float = 5.5

    insertable_springs_thickness: float = 4


@dataclass
class BatteryHolderTolerances:
    battery_diameter_tolerance: float = 1
    battery_length_tolerance: float = 3


def generate_batteries(settings: BatteryHolderSettings, tolerances: BatteryHolderTolerances) -> cq.Workplane:
    s = settings
    t = tolerances
    total_battery_width = s.battery_diameter + 2 * t.battery_diameter_tolerance
    all_batteries_width = s.number_of_batteries * total_battery_width
    total_battery_length = s.battery_length + 2 * t.battery_length_tolerance
    batteries = (cq.Workplane("XY")
                 .transformed(rotate=(90, 180, 0), offset=(0, -s.battery_length/2 - t.battery_length_tolerance, 0))
                 .center(-0.5 * all_batteries_width + 0.5 * total_battery_width, s.floor_thickness + 0.5 * total_battery_width)
                 .center(-total_battery_width, 0)
                 )
    for _ in range(s.number_of_batteries):
        batteries = (batteries
                     .center(total_battery_width, 0)
                     .circle(total_battery_width / 2)
                     .extrude(total_battery_length)
                     )
    return batteries


def generate_battery_holder(settings: BatteryHolderSettings, tolerances: BatteryHolderTolerances) -> cq.Workplane:
    s = settings
    t = tolerances
    total_battery_width = s.battery_diameter + 2 * t.battery_diameter_tolerance
    all_batteries_width = s.number_of_batteries * total_battery_width
    total_width = (all_batteries_width + 2 * s.outer_wall_thickness)
    total_battery_length = s.battery_length + 2 * t.battery_length_tolerance

    battery_holder = (cq.Workplane("XY")
                      .transformed(rotate=(90, 180, 0), offset=(0, -s.battery_length/2 - t.battery_length_tolerance, 0))
                      .move(-total_width / 2, 0)
                      .line(0, s.floor_thickness + s.outer_wall_height)
                      .line(s.outer_wall_thickness, 0)
                      .line(0, -s.outer_wall_height)
                      .line(total_battery_width - 0.5 * s.inner_wall_thickness, 0)
                      )
    for _ in range(s.number_of_batteries - 1):
        battery_holder = (battery_holder
                          .line(0, s.inner_wall_height)
                          .line(s.inner_wall_thickness, 0)
                          .line(0, - s.inner_wall_height)
                          .line(total_battery_width - s.inner_wall_thickness, 0)
                          )
    battery_holder = (battery_holder
                      .line(0.5 * s.inner_wall_thickness, 0)
                      .line(0, s.outer_wall_height)
                      .line(s.outer_wall_thickness, 0)
                      .line(0, -s.outer_wall_height - s.floor_thickness)
                      .close()
                      .extrude(total_battery_length)
                      )
    battery_holder = (battery_holder
                      .faces("<Y")
                      .workplane()
                      .rect(total_width, s.back_wall_height, centered=(True, False))
                      .extrude(s.back_wall_thickness)
                      )
    battery_holder = (battery_holder
                      .faces(">Y")
                      .workplane()
                      .rect(total_width, s.front_wall_height, centered=(True, False))
                      .extrude(s.front_wall_thickness)
                      )
    insertable_springs = (cq.Workplane("XY")
                            .transformed(rotate=(90, 180, 0), offset=(0, +s.battery_length/2 + t.battery_length_tolerance, s.floor_thickness))
                            .rect(all_batteries_width, total_battery_width, centered=(True, False))
                            .extrude(s.insertable_springs_thickness)
                          )
    batteries = generate_batteries(settings, tolerances)
    return battery_holder.cut(batteries).cut(insertable_springs)


if __name__ == "__main__":
    import ocp_vscode

    ocp_vscode.show_all({
        "battery_holder": generate_battery_holder(BatteryHolderSettings(), BatteryHolderTolerances()),
        "batteries": generate_batteries(BatteryHolderSettings(), BatteryHolderTolerances())
    })