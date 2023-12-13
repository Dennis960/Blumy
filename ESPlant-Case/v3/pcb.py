from dataclasses import dataclass
import cadquery as cq
from OCP.TopoDS import TopoDS, TopoDS_Shape, TopoDS_Wire, TopoDS_Edge
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_EDGE, TopAbs_WIRE
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.GeomAbs import GeomAbs_Circle
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeFace, BRepBuilderAPI
from OCP.BRepGProp import BRepGProp, BRepGProp_Face
from OCP.GProp import GProp_GProps

import logging


@dataclass
class WireData:
    ocp_wire: TopoDS_Wire
    opc_edges: list[TopoDS_Edge]
    isCircle: bool
    diameter: float
    enclosed_area: float = 0


def get_area_of_wire(wire: TopoDS_Wire):
    make_face = BRepBuilderAPI_MakeFace(wire)
    face = make_face.Face()
    gprop = GProp_GProps()
    BRepGProp.SurfaceProperties_s(face, gprop)
    return gprop.Mass()


def make_offset_shape(
    cq_object: cq.Workplane,
    board_tolerance: cq.Vector,
    use_fixation_holes: bool,
    fixation_hole_diameter: float,
    hole_tolerance: float,
    fixation_hole_pad_diameter: float,
    pcb_tolerance: float,
):
    logging.info("Making offset shape")
    if board_tolerance.x != board_tolerance.y:
        raise Exception("Different tolerances for x and y are not supported")
    logging.info("Getting original shape")
    orig_shape: TopoDS_Shape = cq_object.val().wrapped
    explorer = TopExp_Explorer(orig_shape, TopAbs_WIRE)
    wires: list[WireData] = []
    logging.info("Exploring wires")
    while explorer.More():
        ocp_wire: TopoDS_Wire = TopoDS.Wire_s(explorer.Current())
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
        enclosed_area = get_area_of_wire(ocp_wire)
        isCircleWire = False
        if len(ocp_edges) == 1 and isCircle:
            isCircleWire = True
        wires.append(WireData(ocp_wire, ocp_edges, isCircleWire, diameter, enclosed_area))
        explorer.Next()

    # find the wires that enclose the most area
    logging.info("Sorting wires")
    wires.sort(key=lambda wire: wire.enclosed_area, reverse=True)
    outline_wires = wires[:2]

    logging.info("Creating faces for outline wires")
    outline_faces: list[cq.Face] = []
    for wire in outline_wires:
        outline_face = cq.Face.makeFromWires(cq.Wire(wire.ocp_wire))
        outline_faces.append(outline_face)
    logging.info("Getting pcb thickness")
    pcb_thickness = outline_faces[1].Center(
    ).z - outline_faces[0].Center().z
    logging.info("Offsetting and extruding outline faces")
    outline_worplane = cq.Workplane(outline_faces[0])
    outline_extrusion = (
        outline_worplane.wires()
        .toPending()
        .offset2D(board_tolerance.x, kind="intersection")
        .extrude(pcb_thickness + board_tolerance.z)
    )

    if use_fixation_holes:
        logging.info("Using fixation holes")
        logging.info("Finding fixation hole wires with fixation hole diameter")
        fixation_hole_wires: list[WireData] = []
        for wire in wires:
            if wire.isCircle and wire.diameter == fixation_hole_diameter:
                fixation_hole_wires.append(wire)
        logging.info("Cutting fixation holes")
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
                .circle(fixation_hole_pad_diameter / 2)
                .cutBlind(100)
            )
    return outline_extrusion
