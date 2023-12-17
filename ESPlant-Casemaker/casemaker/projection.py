from OCP.TopoDS import TopoDS, TopoDS_Face, TopoDS_Wire
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeFace
from OCP.BRepProj import BRepProj_Projection
from OCP.TopAbs import TopAbs_WIRE
from OCP.TopExp import TopExp_Explorer
from OCP import gp

import cadquery as cq
import logging


def project_face_on_face(face_cq_object: cq.Workplane, target_face_cq_object: cq.Workplane):
    """
    Projects the face_cq_object onto the target_face_cq_object and returns a Workplane with the projected wire on the stack
    """
    # get normal of target face
    target_face = target_face_cq_object.val().wrapped
    direction_vec = cq.Face(target_face).normalAt()
    direction = gp.gp_Dir(direction_vec.x, direction_vec.y, direction_vec.z)
    face_wire = face_cq_object.wires().val().wrapped

    projector = BRepProj_Projection(face_wire, target_face, direction)
    projected_wire = projector.Shape()

    return projected_wire


def create_projection_face(cq_object: cq.Workplane, target_face_cq_object: cq.Workplane):
    """
    Creates a face from a projection of the cq_object onto the face of the target_face_cq_object

    :param cq_object: the cq_object that should be projected
    :param target_face_cq_object: the cq_object with a face on the stack that the cq_object should be projected onto
    """
    logging.info("Projecting shape onto target_face")

    logging.info("Generating projected wires")
    projected_wires: list[TopoDS_Wire] = []
    faces_cq_objects = cq_object.faces("not #Z").all()
    for face_cq_object in faces_cq_objects:
        projected_wire = project_face_on_face(
            face_cq_object, target_face_cq_object)
        wire_explorer = TopExp_Explorer(projected_wire, TopAbs_WIRE)
        while wire_explorer.More():
            projected_wire = TopoDS.Wire_s(wire_explorer.Current())
            if projected_wire.Closed():
                projected_wires.append(projected_wire)
            wire_explorer.Next()

    logging.info("Generating projected faces")
    projected_faces: list[TopoDS_Face] = []
    for wire in projected_wires:
        face_builder = BRepBuilderAPI_MakeFace(wire)
        face = face_builder.Face()
        projected_faces.append(face)

    logging.info("Fusing projected faces")
    fused_face = projected_faces[0]
    for face in projected_faces[1:]:
        fuser = BRepAlgoAPI_Fuse(fused_face, face)
        fuser.SimplifyResult()
        fused_face: TopoDS_Face = fuser.Shape()

    logging.info("Done")
    return cq.Workplane(cq.Face(fused_face))


if __name__ == "__main__":
    import ocp_vscode
    from components import battery_springs
    test_cq_object = battery_springs.rotateAboutCenter((0, 1, 1), 20)

    projected_face_cq_object = create_projection_face(test_cq_object)

    ocp_vscode.show_all({
        "original": test_cq_object,
        "projected_face": projected_face_cq_object,
        "projected_face_extruded": projected_face_cq_object.wires().toPending().extrude(1)
    })
