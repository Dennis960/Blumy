import cadquery as cq
from settings import BatteryHolderSettings
from components import battery_springs_front


class BatteryHolder:
    def __init__(self, settings: BatteryHolderSettings = BatteryHolderSettings()):
        self.settings = settings
        self.battery_holder_cq_object = self.generate_battery_holder()
        self.batteries_cq_object = self.generate_batteries()

    def generate_batteries(self) -> cq.Workplane:
        s = self.settings
        total_battery_width = s.battery.diameter + 2 * s.battery_diameter_tolerance
        all_batteries_width = s.number_of_batteries * total_battery_width
        total_battery_length = s.battery.length + 2 * s.battery_length_tolerance
        batteries = (cq.Workplane("XY")
                     .transformed(rotate=(90, 180, 0), offset=(0, -s.battery.length/2 - s.battery_length_tolerance, 0))
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

    def _generate_polarity_text(self) -> cq.Workplane:
        s = self.settings
        total_battery_width = s.battery.diameter + 2 * s.battery_diameter_tolerance
        all_batteries_width = s.number_of_batteries * total_battery_width
        total_battery_length = s.battery.length + 2 * s.battery_length_tolerance

        polarity_text = (cq.Workplane("XY")
                         .transformed(rotate=(0, 0, 90), offset=(0, 0, s.floor_thickness - (0 if s.polarity_text_direction == "Extrude" else s.text_thickness)))
                         .center(0, all_batteries_width / 2 + 0.5 * total_battery_width)
                         )
        for i in range(s.number_of_batteries):
            even = i % 2 == 0
            polarity_text: cq.Workplane = (polarity_text
                                           .center(-s.polartiy_text_spacing * total_battery_length, -total_battery_width)
                                           .text("+" if even ^ s.flip_polarity else "-", s.text_size, s.text_thickness, cut=False, combine="a")
                                           .center(2 * s.polartiy_text_spacing * total_battery_length, 0)
                                           .text("-" if even ^ s.flip_polarity else "+", s.text_size, s.text_thickness, cut=False, combine="a")
                                           .center(-s.polartiy_text_spacing * total_battery_length, 0)
                                           .text(s.center_text, s.text_size, s.text_thickness, cut=False, combine="a")
                                           )
        return polarity_text

    def generate_battery_holder(self) -> cq.Workplane:
        s = self.settings
        total_battery_width = s.battery.diameter + 2 * s.battery_diameter_tolerance
        all_batteries_width = s.number_of_batteries * total_battery_width
        total_width = (all_batteries_width + 2 * s.outer_wall_thickness)
        total_battery_length = s.battery.length + 2 * s.battery_length_tolerance

        battery_holder = (cq.Workplane("XY")
                          .transformed(rotate=(90, 180, 0), offset=(0, -s.battery.length/2 - s.battery_length_tolerance, 0))
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
                          .extrude(total_battery_length + s.front_wall_thickness)
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
                          .extrude(-s.insertable_springs_thickness)
                          )
        # TODO This uses hardcoded values
        insertable_springs = battery_springs_front.translate(
            (0, +s.battery.length/2 + s.battery_length_tolerance -
             1 + s.front_wall_thickness, s.floor_thickness)
        )
        batteries = self.generate_batteries()
        polarity_text = self._generate_polarity_text()
        battery_holder = battery_holder.cut(batteries).cut(insertable_springs)
        if s.polarity_text_direction == "Cut":
            battery_holder = battery_holder.cut(polarity_text)
        else:
            battery_holder = battery_holder.union(polarity_text)
        return battery_holder

    def translate(self, vec: cq.Vector):
        self.battery_holder_cq_object = self.battery_holder_cq_object.translate(
            vec)
        self.batteries_cq_object = self.batteries_cq_object.translate(vec)

    def rotate(self, axisStartPoint: cq.Vector, axisEndPoint: cq.Vector, angleDegrees: float):
        self.battery_holder_cq_object = self.battery_holder_cq_object.rotate(
            axisStartPoint, axisEndPoint, angleDegrees)
        self.batteries_cq_object = self.batteries_cq_object.rotate(
            axisStartPoint, axisEndPoint, angleDegrees)


if __name__ == "__main__":
    import ocp_vscode

    battery_holder = BatteryHolder()

    ocp_vscode.show_all({
        "battery_holder": battery_holder.battery_holder_cq_object,
        "batteries": battery_holder.batteries_cq_object,
        "battery_springs_front": battery_springs_front.translate(
            (0, +battery_holder.settings.battery.length/2 + battery_holder.settings.battery_length_tolerance +
             battery_holder.settings.insertable_springs_thickness, battery_holder.settings.floor_thickness)
        ),
    })
