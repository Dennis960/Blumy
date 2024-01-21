from flask_wtf import FlaskForm
from wtforms import BooleanField, SelectField
from wtforms.validators import InputRequired, Optional

from .fields import BootstrapDecimalField, BootstrapStringField, BootstrapVectorField, SelectPCBPartField, SelectMultiplePCBPartField

class PartSettingForm(FlaskForm):
    top_direction = SelectField('Top Direction', 
                                choices=['>X', '>Y', 
                                         '>Z', '<X', 
                                         '<Y', '<Z'],
                                validators=[InputRequired()])
    length = BootstrapDecimalField('Length', validators=[Optional()])
    create_hole = BooleanField('Ignore length, create a hole', default=True)
    offset = BootstrapVectorField('Offset', validators=[InputRequired()], default=(0, 0, 0))
    width = BootstrapDecimalField('Width', validators=[Optional()], default=None)
    width_auto = BooleanField('Auto width', default=True) # TODO enforce that either auto=True or the other value is set
    height = BootstrapDecimalField('Height', validators=[Optional()], default=None)
    height_auto = BooleanField('Auto height', default=True)

class CaseSettingsForm(FlaskForm):
    case_wall_thickness = BootstrapDecimalField('Wall Thickness', validators=[InputRequired()], default=1.5)
    case_floor_pad = BootstrapDecimalField('Floor Pad', validators=[InputRequired()], default=0)
    case_dimension = BootstrapVectorField('Dimension', validators=[Optional()], default=(None, None, None))
    case_dimension_x_auto = BooleanField('Auto Dimension X', default=True)
    case_dimension_y_auto = BooleanField('Auto Dimension Y', default=True)
    case_dimension_z_auto = BooleanField('Auto Dimension Z', default=True)
    case_offset = BootstrapVectorField('Offset', validators=[Optional()], default=(0, 0, 0))
    case_offset_x_positive = BooleanField('Align to parts in +X', default=False) # TODO validation
    case_offset_x_negative = BooleanField('Align to parts in -X', default=False)
    case_offset_y_positive = BooleanField('Align to parts in +Y', default=False)
    case_offset_y_negative = BooleanField('Align to parts in -Y', default=False)
    case_offset_z_positive = BooleanField('Align to parts in +Z', default=False)
    case_offset_z_negative = BooleanField('Align to parts in -Z', default=False)
    pcb_slot_side = SelectField('PCB Slot Side', 
                                choices=['TOP', 'BOTTOM'],
                                validators=[InputRequired()],
                                default='BOTTOM')
    pcb_should_include_components = BooleanField('Include components of PCB', default=True)
    pcb_use_tolerance = BooleanField('Use tolerance for PCB', default=True)

class BoardSettingsForm(FlaskForm):
    name = BootstrapStringField('Name', validators=[InputRequired()])
    pcb_tolerance = BootstrapVectorField('PCB Tolerance', validators=[InputRequired()], default=(1.5, 1.5, 0.5))
    part_tolerance = BootstrapDecimalField('Part Tolerance', validators=[InputRequired()], default=1)
    pcb_part_name = SelectPCBPartField('PCB Part Name', validators=[InputRequired()], choices=[], default="PCB")
    exclude = SelectMultiplePCBPartField('Exclude', choices=[], default=[])
    parts_without_tolerances = SelectMultiplePCBPartField('Parts Without Tolerances', choices=[], default=[])

class CompartmentDoorSettingsForm(FlaskForm):
    compartment_door_dimensions = BootstrapStringField('Compartment Door Dimensions', default="(50, 60, 1.5)")
    fitting_arm_thickness = BootstrapDecimalField('Fitting Arm Thickness', default=1.5)
    fitting_arm_height = BootstrapDecimalField('Fitting Arm Height', default=10)
    fitting_arm_width = BootstrapDecimalField('Fitting Arm Width', default=16)
    fitting_arm_distance_factor = BootstrapDecimalField('Fitting Arm Distance Factor', default=2)
    fitting_arm_angle_offset = BootstrapDecimalField('Fitting Arm Angle Offset', default=0.5)
    fitting_arm_frame_thickness = BootstrapDecimalField('Fitting Arm Frame Thickness', default=1.5)
    tab_dimension = BootstrapStringField('Tab Dimension', default="(2, 3)")
    tab_spacing_factor = BootstrapDecimalField('Tab Spacing Factor', default=0.5)
    recessed_edge_width = BootstrapDecimalField('Recessed Edge Width', default=2)
    snap_joint_overhang = BootstrapDecimalField('Snap Joint Overhang', default=1)
    snap_joint_face_selectors = BootstrapStringField('Snap Joint Face Selectors', default="['+Y']")
    tabs_face_selector = SelectField('Tabs Face Selector',
                               choices=[('<y', '<Y'), ('>y', '>Y'), 
                                        ('x', '>X'), ('y', '<X')],
                               default='<Y')
    text_size = BootstrapDecimalField('Text Size', default=10)
    frame_text_size = BootstrapDecimalField('Frame Text Size', default=5)
    text_thickness = BootstrapDecimalField('Text Thickness', default=0.5)
    compartment_door_text = BootstrapStringField('Compartment Door Text', default="")
    frame_text = BootstrapStringField('Frame Text', default="")
    tab_tolerance = BootstrapDecimalField('Tab Tolerance', default=0.5)
    fitting_arm_tolerance = BootstrapDecimalField('Fitting Arm Tolerance', default=0.5)
    compartment_door_tolerance = BootstrapDecimalField('Compartment Door Tolerance', default=0.5)
