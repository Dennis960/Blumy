from dataclasses import dataclass
import cadquery as cq
from OCP.TopoDS import TopoDS, TopoDS_Shape, TopoDS_Wire, TopoDS_Edge
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_EDGE, TopAbs_WIRE
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.GeomAbs import GeomAbs_Circle
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeFace
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps

from settings import MountingHoleSettings
from functools import cache
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


@cache
def get_wire_data_list(
    pcb_cq_object: cq.Workplane,
) -> list[WireData]:
    orig_shape: TopoDS_Shape = pcb_cq_object.val().wrapped
    wire_data_list: list[WireData] = []
    logging.info("Exploring wires")
    explorer = TopExp_Explorer(orig_shape, TopAbs_WIRE)
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
        wire_data_list.append(WireData(ocp_wire, ocp_edges,
                                       isCircleWire, diameter, enclosed_area))
        explorer.Next()
    return wire_data_list


def make_offset_shape(
    pcb_cq_object: cq.Workplane,
    board_tolerance: cq.Vector,
):
    logging.info("Making offset shape")
    if board_tolerance.x != board_tolerance.y:
        raise Exception("Different tolerances for x and y are not supported")

    wire_data_list = get_wire_data_list(pcb_cq_object)

    # find the wires that enclose the most area
    logging.info("Sorting wires")
    wire_data_list.sort(key=lambda wire: wire.enclosed_area, reverse=True)
    outline_wires = wire_data_list[:2]

    logging.info("Sorting outline_wires by center z position")
    outline_wires.sort(key=lambda wire: cq.Wire(wire.ocp_wire).Center().z)

    logging.info("Creating faces for outline wires")
    outline_faces: list[cq.Face] = []
    for wire in outline_wires:
        outline_face = cq.Face.makeFromWires(cq.Wire(wire.ocp_wire))
        outline_faces.append(outline_face)
    logging.info("Getting pcb thickness")
    pcb_thickness = outline_faces[1].Center(
    ).z - outline_faces[0].Center().z
    logging.info("Offsetting and extruding outline faces")
    outline_worplane = cq.Workplane(outline_faces[0]).tag("a")
    outline_extrusion = (
        outline_worplane.wires()
        .toPending()
        .offset2D(board_tolerance.x, kind="intersection")
        .extrude(pcb_thickness + board_tolerance.z)
    )
    return outline_extrusion


def get_auto_detected_mounting_hole_settings(pcb_cq_object: cq.Workplane, default_mounting_hole_settings: MountingHoleSettings):
    """
    Returns a list of mounting hole settings that were auto detected using the default mounting hole diameter
    """
    logging.info("Finding mounting hole wires with mounting hole diameter")
    mounting_hole_wires: list[WireData] = []
    wire_data_list = get_wire_data_list(pcb_cq_object)
    for wire in wire_data_list:
        if wire.isCircle and wire.diameter == default_mounting_hole_settings.diameter:
            mounting_hole_wires.append(wire)
    logging.info("Sorting mounting hole wires by center z position")
    mounting_hole_wires.sort(key=lambda wire: cq.Wire(
        wire.ocp_wire).Center().z)
    # remove last half of mounting hole wires to only get the bottom ones
    mounting_hole_wires = mounting_hole_wires[:len(mounting_hole_wires) // 2]

    logging.info("Generating mounting_hole_settings")
    mounting_hole_settings: list[MountingHoleSettings] = []
    for wire in mounting_hole_wires:
        edge: TopoDS_Edge = wire.opc_edges[0]
        curveAdaptor = BRepAdaptor_Curve(edge)

        circle_center = curveAdaptor.Circle().Location()
        radius = curveAdaptor.Circle().Radius()

        mounting_hole_setting = default_mounting_hole_settings.clone()
        mounting_hole_setting.position = cq.Vector(
            circle_center.X(), circle_center.Y(), circle_center.Z())
        mounting_hole_setting.diameter = radius * 2
        mounting_hole_settings.append(mounting_hole_setting)
    return mounting_hole_settings
