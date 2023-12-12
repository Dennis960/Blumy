from dataclasses import dataclass
import cadquery as cq
from OCP.TopoDS import TopoDS_Shape, TopoDS_Wire, TopoDS_Edge
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_EDGE, TopAbs_WIRE
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.GeomAbs import GeomAbs_Circle


@dataclass
class WireData:
    ocp_wire: TopoDS_Wire
    opc_edges: list[TopoDS_Edge]
    isCircle: bool
    diameter: float


def make_offset_shape(
    cq_object: cq.Workplane,
    board_tolerance: cq.Vector,
    use_fixation_holes: bool,
    fixation_hole_diameter: float,
    hole_tolerance: float,
    fixation_hole_bigger_diameter: float,
    pcb_thickness: float,
    pcb_tolerance: float,
):
    if board_tolerance.x != board_tolerance.y:
        raise Exception("Different tolerances for x and y are not supported")
    orig_shape: TopoDS_Shape = cq_object.val().wrapped
    explorer = TopExp_Explorer(orig_shape, TopAbs_WIRE)
    wires: list[WireData] = []
    while explorer.More():
        ocp_wire: TopoDS_Wire = explorer.Current()
        edgeExplorer = TopExp_Explorer(ocp_wire, TopAbs_EDGE)
        ocp_edges: list[TopoDS_Edge] = []
        diameter = -1
        while edgeExplorer.More():
            shape: TopoDS_Shape = edgeExplorer.Current()
            edge: TopoDS_Edge = cq.Edge(shape).wrapped
            ocp_edges.append(edge)
            edgeExplorer.Next()
            curveAdaptor = BRepAdaptor_Curve(edge)
            isCircle = curveAdaptor.GetType() == GeomAbs_Circle
            if isCircle:
                diameter = curveAdaptor.Circle().Radius() * 2
        isCircleWire = False
        if len(ocp_edges) == 1 and isCircle:
            isCircleWire = True
        wires.append(WireData(ocp_wire, ocp_edges, isCircleWire, diameter))
        explorer.Next()

    # find the wires with the most edges, those are the outline wires
    # TODO this won't work for all shapes, better approach would be to find the wires that
    # enclose the most area
    wires.sort(key=lambda wire: len(wire.opc_edges), reverse=True)
    outline_wires = wires[:2]

    outline_faces: list[cq.Face] = []
    for wire in outline_wires:
        outline_face = cq.Face.makeFromWires(cq.Wire(wire.ocp_wire))
        outline_faces.append(outline_face)
    # get distance between the two faces
    outline_distance = outline_faces[1].Center(
    ).z - outline_faces[0].Center().z
    # offset the first face and extrude it until the second face
    outline_worplane = cq.Workplane(outline_faces[0])
    outline_extrusion = (
        outline_worplane.wires()
        .toPending()
        .offset2D(board_tolerance.x, kind="intersection")
        .extrude(outline_distance + board_tolerance.z)
    )

    if use_fixation_holes:
        # find all wires with a diameter of fixation_hole_diameter
        fixation_hole_wires: list[WireData] = []
        for wire in wires:
            if wire.isCircle and wire.diameter == fixation_hole_diameter:
                fixation_hole_wires.append(wire)
        # create a new circle at the same position with a smaller diameter and cut it out from the outline extrusion
        outline_extrusion = outline_extrusion.tag("a")
        for wire in fixation_hole_wires:
            edge: TopoDS_Edge = wire.opc_edges[0]
            curveAdaptor = BRepAdaptor_Curve(edge)
            circle_center = curveAdaptor.Circle().Location()
            radius = curveAdaptor.Circle().Radius()
            outline_extrusion = (
                outline_extrusion
                .workplaneFromTagged("a")
                .moveTo(circle_center.X(), circle_center.Y())
                .circle(radius - hole_tolerance)
                .cutBlind(pcb_thickness + pcb_tolerance)
                .workplane()
                .moveTo(circle_center.X(), circle_center.Y())
                .circle(fixation_hole_bigger_diameter / 2)
                .cutBlind(100)
            )
    return outline_extrusion
