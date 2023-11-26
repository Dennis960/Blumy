from dataclasses import dataclass
import cadquery as cq

@dataclass
class Part:
    name: str
    bound_box: cq.BoundBox
    cq_bounding_box: cq.Workplane
    cq_object: cq.Workplane
