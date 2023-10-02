import cadquery as cq

battery_spring_tolerance = 1

# battery_spring
battery_spring_hole_size = (3.3, 0.5) # oval
battery_spring_thickness = battery_spring_hole_size[1] + battery_spring_tolerance
battery_spring_contact_size = 11
battery_spring_leg_size = (battery_spring_hole_size[0] + battery_spring_tolerance, battery_spring_thickness, 8)
battery_spring_contact_size = (battery_spring_contact_size, battery_spring_thickness, battery_spring_contact_size)
battery_spring_spring_length = 8
battery_spring_spring_width = 7
battery_spring_position = (5.5, 49.1)

xy = cq.Workplane("XY")

battery_spring_leg = xy.rect(battery_spring_leg_size[0], battery_spring_leg_size[1]).extrude(battery_spring_leg_size[2])
battery_spring_contact = xy.rect(battery_spring_contact_size[0], battery_spring_contact_size[1]).extrude(-battery_spring_contact_size[2])
battery_spring_springs = battery_spring_contact.faces(">Y").workplane(centerOption="CenterOfBoundBox").rect(battery_spring_spring_width, battery_spring_contact_size[0]).extrude(battery_spring_spring_length)
battery_springs = battery_spring_leg.union(battery_spring_contact).union(battery_spring_springs)
battery_springs = battery_springs.union(battery_springs.mirror(mirrorPlane=battery_springs.faces(">X")))
battery_springs = battery_springs.translate((battery_spring_position[0], -battery_spring_position[1], 0))
