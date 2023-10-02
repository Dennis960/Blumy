import cadquery as __cq

__battery_spring_tolerance = 1

# battery_spring
__battery_spring_hole_size = (3.3, 0.5) # oval
__battery_spring_thickness = __battery_spring_hole_size[1] + __battery_spring_tolerance
__battery_spring_contact_size = 11
__battery_spring_leg_size = (__battery_spring_hole_size[0] + __battery_spring_tolerance, __battery_spring_thickness, 8)
__battery_spring_contact_size = (__battery_spring_contact_size, __battery_spring_thickness, __battery_spring_contact_size)
__battery_spring_spring_length = 8
__battery_spring_spring_width = 7
__battery_spring_position = (5.5, 49.1)

__xy = __cq.Workplane("XY")

__battery_spring_leg = __xy.rect(__battery_spring_leg_size[0], __battery_spring_leg_size[1]).extrude(__battery_spring_leg_size[2])
__battery_spring_contact = __xy.rect(__battery_spring_contact_size[0], __battery_spring_contact_size[1]).extrude(-__battery_spring_contact_size[2])
__battery_spring_springs = __battery_spring_contact.faces(">Y").workplane(centerOption="CenterOfBoundBox").rect(__battery_spring_spring_width, __battery_spring_contact_size[0]).extrude(__battery_spring_spring_length)
battery_springs = __battery_spring_leg.union(__battery_spring_contact).union(__battery_spring_springs)
battery_springs = battery_springs.union(battery_springs.mirror(mirrorPlane=battery_springs.faces(">X")))
battery_springs = battery_springs.translate((__battery_spring_position[0], -__battery_spring_position[1], 0))
