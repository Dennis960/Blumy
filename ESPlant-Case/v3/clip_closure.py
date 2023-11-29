import cadquery as cq

### ----------------- Clip closure -----------------###

clip_closure_thickness = 1.5
clip_closure_height = 10
box_dimensions = (50, 60, 1.5)
inserters_dimensions = (box_dimensions[0] / 2, 3, 3)
clip_closure_faces_selector = "+Y"
inserter_face_selector = "<Y"

clip_closure = (cq.Workplane("XY").box(50, 60, box_dimensions[2])
                .faces(clip_closure_faces_selector)
                .each(
                    lambda cq_object: cq.Workplane(cq_object)
    .workplane()
    .transformed(offset=(0, 0.5 * box_dimensions[2], 0), rotate=(0, -90, 0))
    .line(clip_closure_thickness, 0)
    .line(0.5, -clip_closure_height + 1.5 * clip_closure_thickness)
    .threePointArc((2 * clip_closure_thickness + 0.5, -clip_closure_height + clip_closure_thickness), (3 * clip_closure_thickness, -clip_closure_height + 1.5 * clip_closure_thickness))
    .line(0.5, +clip_closure_height - 1.5 * clip_closure_thickness)
    .line(clip_closure_thickness, 0)
    .line(-0.5, -clip_closure_height + 1.5 * clip_closure_thickness)
    .threePointArc((2 * clip_closure_thickness + 0.5, -clip_closure_height), (0.5, -clip_closure_height + 1.5 * clip_closure_thickness))
    .lineTo(0, -box_dimensions[2])
    .lineTo(0, 0)
    .close()
    .extrude(7.5, both=True)
    .transformed(rotate=(90, 0, 0))
    .moveTo(5.5, 0)
    .rect(4, 8)
    .cutBlind(4)
    .center(3 * clip_closure_thickness + 0.5, 0)
    .move(0, -4)
    .line(0, -clip_closure_thickness)
    .line(1.5*clip_closure_thickness, 0)
    .threePointArc((2.5*clip_closure_thickness, 0), (1.5*clip_closure_thickness, 4 + clip_closure_thickness))
    .line(-1.5*clip_closure_thickness, 0)
    .line(0, -clip_closure_thickness)
    .line(clip_closure_thickness, 0)
    .threePointArc((1.5 * clip_closure_thickness, 0), (clip_closure_thickness, -4))
    .line(-clip_closure_thickness, 0)
    .close()

    .extrude(clip_closure_thickness).val(),
    combine="a"
)
    .faces(inserter_face_selector)
    .workplane()
    .moveTo(-inserters_dimensions[0] / 2, -box_dimensions[2])
    .line(inserters_dimensions[0], 0, forConstruction=True)
    .vertices()
    .rect(inserters_dimensions[1], clip_closure_thickness)
    .extrude(inserters_dimensions[2], both=True)
)