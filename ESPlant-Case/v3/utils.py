import math
from dataclasses import dataclass

def convert_rotation(x, y, z, w):
    # Convert quaternion to axis-angle representation
    angle_rad = 2 * math.acos(w)
    angle_deg = math.degrees(angle_rad)
    sin_angle = math.sqrt(1 - w*w)
    
    if sin_angle < 1e-6:
        # If sin(angle/2) is close to zero, the axis can be anything
        axis_start_point = (1, 0, 0)
        axis_end_point = (1, 0, 0)
    else:
        # Calculate axis of rotation
        axis_x = x / sin_angle
        axis_y = y / sin_angle
        axis_z = z / sin_angle
        axis_start_point = (axis_x, axis_y, axis_z)
        axis_end_point = (-axis_x, -axis_y, -axis_z)
    
    rotation_info = {
        "axisStartPoint": axis_start_point,
        "axisEndPoint": axis_end_point,
        "angleDegrees": angle_deg
    }
    
    return rotation_info


@dataclass
class Part:
    name: str
    file: str
    posx: float
    posy: float
    posz: float
    rotx: float
    roty: float
    rotz: float
    rotw: float