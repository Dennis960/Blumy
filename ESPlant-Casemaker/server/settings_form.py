from flask_wtf import FlaskForm
from wtforms import StringField, DecimalField, BooleanField, SelectField, IntegerField, SelectMultipleField
from wtforms.validators import DataRequired, Optional

class SelectPCBPartField(SelectField):
    pass

class SelectMultiplePCBPartField(SelectMultipleField):
    pass

class PartSettingForm(FlaskForm):
    top_direction = SelectField('Top Direction', 
                                choices=['>X', '>Y', 
                                         '>Z', '<X', 
                                         '<Y', '<Z'],
                                validators=[DataRequired()])
    length = StringField('Length', validators=[DataRequired()])
    create_hole = BooleanField('Create a hole', default=False)
    offset_x = DecimalField('Offset X', validators=[Optional()])
    offset_y = DecimalField('Offset Y', validators=[Optional()])
    offset_z = DecimalField('Offset Z', validators=[Optional()])
    width = DecimalField('Width', default=None, validators=[Optional()])
    width_auto = BooleanField('Auto width', default=False)
    height = DecimalField('Height', default=None, validators=[Optional()])
    height_auto = BooleanField('Auto height', default=False)

class CaseSettingsForm(FlaskForm):
    case_wall_thickness = DecimalField('Case Wall Thickness', default=1.5)
    case_floor_pad = DecimalField('Case Floor Pad', default=0)
    case_dimension = StringField('Case Dimension', default="(Auto, Auto, Auto)")
    case_offset = StringField('Case Offset', default="(0, 0, 0)")
    should_cut_pcb_slot = BooleanField('Should Cut PCB Slot', default=True)
    pcb_slot_side = SelectField('PCB Slot Side', 
                                choices=[('top', 'TOP'), ('bottom', 'BOTTOM')],
                                default='BOTTOM')

class BoardSettingsForm(FlaskForm):
    name = StringField('Name')
    pcb_tolerance_x = DecimalField('PCB Tolerance X', default=1.5)
    pcb_tolerance_y = DecimalField('PCB Tolerance Y', default=1.5)
    pcb_tolerance_z = DecimalField('PCB Tolerance Z', default=0.5)
    part_tolerance = DecimalField('Part Tolerance', default=1)
    pcb_part_name = SelectPCBPartField('PCB Part Name', choices=[], default="PCB")
    exclude = SelectMultiplePCBPartField('Exclude', choices=[])
    parts_without_tolerances = SelectMultiplePCBPartField('Parts Without Tolerances', choices=[])

class MountingHoleSettingsForm(FlaskForm):
    position = StringField('Position', default="(0, 0, 0)")
    diameter = DecimalField('Diameter', default=2.0)
    pad_diameter = DecimalField('Pad Diameter', default=5.0)
    tolerance = DecimalField('Tolerance', default=0.1)
    hole_type = SelectField('Hole Type', 
                            choices=[('through-hole', 'Through-Hole'), ('standoff', 'Standoff')],
                            default='Through-Hole')

class CompartmentDoorSettingsForm(FlaskForm):
    compartment_door_dimensions = StringField('Compartment Door Dimensions', default="(50, 60, 1.5)")
    fitting_arm_thickness = DecimalField('Fitting Arm Thickness', default=1.5)
    fitting_arm_height = DecimalField('Fitting Arm Height', default=10)
    fitting_arm_width = DecimalField('Fitting Arm Width', default=16)
    fitting_arm_distance_factor = DecimalField('Fitting Arm Distance Factor', default=2)
    fitting_arm_angle_offset = DecimalField('Fitting Arm Angle Offset', default=0.5)
    fitting_arm_frame_thickness = DecimalField('Fitting Arm Frame Thickness', default=1.5)
    tab_dimension = StringField('Tab Dimension', default="(2, 3)")
    tab_spacing_factor = DecimalField('Tab Spacing Factor', default=0.5)
    recessed_edge_width = DecimalField('Recessed Edge Width', default=2)
    snap_joint_overhang = DecimalField('Snap Joint Overhang', default=1)
    snap_joint_face_selectors = StringField('Snap Joint Face Selectors', default="['+Y']")
    tabs_face_selector = SelectField('Tabs Face Selector',
                               choices=[('<y', '<Y'), ('>y', '>Y'), 
                                        ('x', '>X'), ('y', '<X')],
                               default='<Y')
    text_size = DecimalField('Text Size', default=10)
    frame_text_size = DecimalField('Frame Text Size', default=5)
    text_thickness = DecimalField('Text Thickness', default=0.5)
    compartment_door_text = StringField('Compartment Door Text', default="")
    frame_text = StringField('Frame Text', default="")
    tab_tolerance = DecimalField('Tab Tolerance', default=0.5)
    fitting_arm_tolerance = DecimalField('Fitting Arm Tolerance', default=0.5)
    compartment_door_tolerance = DecimalField('Compartment Door Tolerance', default=0.5)

class BatteryForm(FlaskForm):
    diameter = DecimalField('Diameter', validators=[DataRequired()])
    length = DecimalField('Length', validators=[DataRequired()])

class BatteryHolderSettingsForm(FlaskForm):
    battery = StringField('Battery', default="AAA")
    number_of_batteries = IntegerField('Number of Batteries', default=2)
    floor_thickness = DecimalField('Floor Thickness', default=1.5)
    outer_wall_height = DecimalField('Outer Wall Height', default=8)
    outer_wall_thickness = DecimalField('Outer Wall Thickness', default=1.5)
    inner_wall_height = DecimalField('Inner Wall Height', default=5)
    inner_wall_thickness = DecimalField('Inner Wall Thickness', default=1.5)
    front_wall_height = DecimalField('Front Wall Height', default=11)
    front_wall_thickness = DecimalField('Front Wall Thickness', default=5)
    back_wall_height = DecimalField('Back Wall Height', default=11)
    back_wall_thickness = DecimalField('Back Wall Thickness', default=5)
    insertable_springs_thickness = DecimalField('Insertable Springs Thickness', default=4)
    center_text = StringField('Center Text', default="AAA")
    text_size = DecimalField('Text Size', default=5)
    text_thickness = DecimalField('Text Thickness', default=0.5)
    flip_polarity = BooleanField('Flip Polarity', default=False)
    polarity_text_direction = SelectField('Polarity Text Direction',
                               choices=[ ('cut', 'Cut'), ('extrude', 'Extrude')],
                               default='Cut')
    polarity_text_spacing = DecimalField('Polarity Text Spacing', default=0.4)
    battery_diameter_tolerance = DecimalField('Battery Diameter Tolerance', default=1)
    battery_length_tolerance = DecimalField('Battery Length Tolerance', default=1)