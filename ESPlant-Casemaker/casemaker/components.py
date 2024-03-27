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

if __name__ == "__main__":
    import ocp_vscode
    ocp_vscode.show_object(battery_springs)
