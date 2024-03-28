import cadquery as cq

thickness = 1.5
leg_width = 4.3
contact_width = 9
contact_height = 13.5
spring_width = 5.5
spring_length = 8
leg_length = 8
spacing = 11
battery_spring_position = (6.5, 45)

battery_spring = (cq.Workplane()
                  .moveTo(-0.5 * contact_width, -0.5 * thickness)
                  .line(0, thickness)
                  .line(0.5 * (contact_width - spring_width), 0)
                  .line(0, spring_length)
                  .line(spring_width, 0)
                  .line(0, -spring_length)
                  .line(0.5 * (contact_width - spring_width), 0)
                  .line(0, -thickness)
                  .line(-contact_width, 0)
                  .close()
                  .extrude(-contact_height)
                  .moveTo(0, 0)
                  .rect(leg_width, thickness)
                  .extrude(leg_length)
                  )
battery_spring_left = battery_spring
battery_spring_right = battery_spring_left.translate((spacing, 0, 0))

battery_springs = battery_spring_left.union(battery_spring_right)

battery_springs = battery_springs.translate(
    (battery_spring_position[0], -battery_spring_position[1], 0)
)

battery_spring_2_width = 21
battery_spring_2_width_tolerance = 1
battery_spring_2_height = 9.5
battery_spring_2_thickness = 1
battery_spring_2_inserter_width = 5
battery_spring_2_inserter_height = 1.5
battery_spring_2_gap_width = 2
battery_spring_2_gap_height = 5
battery_spring_2_nipple_pos_y = 0.5
battery_spring_2_nipple_width = 2
battery_spring_2_nipple_height = 1.5
battery_spring_2_nipple_thickness = 0.5
battery_spring_2_spring_diameter = 6
battery_spring_2_spring_offset_y = 1
battery_spring_2_spring_thickness = 6

battery_spring_2_width += battery_spring_2_width_tolerance
battery_spring_2_inserter_padding = 0.5 * \
    (0.5*(battery_spring_2_width-battery_spring_2_gap_width) -
     battery_spring_2_inserter_width)

battery_spring_front_left = (cq.Workplane("XZ")
                             .tag("xz")
                             .moveTo(-0.5 * battery_spring_2_width, battery_spring_2_height)
                             .line(0.5 * battery_spring_2_width, 0)
                             .line(0, -(battery_spring_2_height - battery_spring_2_gap_height))
                             .line(-0.5*battery_spring_2_gap_width, 0)
                             .line(0, -battery_spring_2_gap_height)
                             .line(-battery_spring_2_inserter_padding, 0)
                             .line(0, -battery_spring_2_inserter_height)
                             .line(-battery_spring_2_inserter_width, 0)
                             .line(0, battery_spring_2_inserter_height)
                             .line(-battery_spring_2_inserter_padding, 0)
                             .line(0, battery_spring_2_height)
                             .close()
                             .extrude(battery_spring_2_thickness)
                             .moveTo(-0.25 * battery_spring_2_width - 0.5*battery_spring_2_nipple_width, battery_spring_2_nipple_pos_y)
                             .rect(battery_spring_2_nipple_width, battery_spring_2_nipple_height, centered=False)
                             .extrude(-battery_spring_2_nipple_thickness)
                             .workplaneFromTagged("xz")
                             .workplane(offset=battery_spring_2_thickness)
                             .moveTo(-0.25 * battery_spring_2_width, battery_spring_2_height - battery_spring_2_spring_diameter - battery_spring_2_spring_offset_y)
                             .rect(battery_spring_2_spring_diameter, battery_spring_2_spring_diameter + battery_spring_2_spring_offset_y, centered=(True, False))
                             .extrude(battery_spring_2_spring_thickness)
                             )

battery_spring_right = battery_spring_front_left.mirror("YZ")
battery_springs_front = battery_spring_front_left.union(battery_spring_right)

if __name__ == "__main__":
    import ocp_vscode
    ocp_vscode.show_all({
        "battery_springs": battery_springs,
        "battery_springs_front": battery_springs_front,
    })
