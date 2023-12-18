from flask_wtf import FlaskForm
from wtforms import StringField, FloatField, BooleanField, SelectField, IntegerField, SelectMultipleField
from wtforms.validators import DataRequired, Optional

class PartSettingForm(FlaskForm):
    name_regex = StringField('Name Regex', validators=[DataRequired()])
    top_direction = SelectField('Top Direction', 
                              choices=[('x', '>X'), ('y', '>Y'), 
                                       ('z', '>Z'), ('-x', '<X'), 
                                       ('-y', '<Y'), ('-z', '<Z')],
                              validators=[DataRequired()])
    length = StringField('Length', validators=[DataRequired()])
    offset_x = FloatField('Offset X', validators=[Optional()])
    offset_y = FloatField('Offset Y', validators=[Optional()])
    offset_z = FloatField('Offset Z', validators=[Optional()])
    width = StringField('Width', default="Auto")
    height = StringField('Height', default="Auto")

class CaseSettingsForm(FlaskForm):
    case_wall_thickness = FloatField('Case Wall Thickness', default=1.5)
    case_floor_pad = FloatField('Case Floor Pad', default=0)
    case_dimension = StringField('Case Dimension', default="(Auto, Auto, Auto)")
    case_offset = StringField('Case Offset', default="(0, 0, 0)")
    should_cut_pcb_slot = BooleanField('Should Cut PCB Slot', default=True)
    pcb_slot_side = SelectField('PCB Slot Side', 
                                choices=[('top', 'TOP'), ('bottom', 'BOTTOM')],
                                default='BOTTOM')

class BoardSettingsForm(FlaskForm):
    pcb_tolerance_x = FloatField('PCB Tolerance X', default=1.5)
    pcb_tolerance_y = FloatField('PCB Tolerance Y', default=1.5)
    pcb_tolerance_z = FloatField('PCB Tolerance Z', default=0.5)
    part_tolerance = FloatField('Part Tolerance', default=1)
    pcb_part_name = SelectMultipleField('PCB Part Name', choices=[], default="PCB")
    exclude = SelectMultipleField('Exclude', choices=[])
    parts_without_tolerances = SelectMultipleField('Parts Without Tolerances', choices=[])

class MountingHoleSettingsForm(FlaskForm):
    position = StringField('Position', default="(0, 0, 0)")
    diameter = FloatField('Diameter', default=2.0)
    pad_diameter = FloatField('Pad Diameter', default=5.0)
    tolerance = FloatField('Tolerance', default=0.1)
    hole_type = SelectField('Hole Type', 
                            choices=[('through-hole', 'Through-Hole'), ('standoff', 'Standoff')],
                            default='Through-Hole')

class CompartmentDoorSettingsForm(FlaskForm):
    compartment_door_dimensions = StringField('Compartment Door Dimensions', default="(50, 60, 1.5)")
    fitting_arm_thickness = FloatField('Fitting Arm Thickness', default=1.5)
    fitting_arm_height = FloatField('Fitting Arm Height', default=10)
    fitting_arm_width = FloatField('Fitting Arm Width', default=16)
    fitting_arm_distance_factor = FloatField('Fitting Arm Distance Factor', default=2)
    fitting_arm_angle_offset = FloatField('Fitting Arm Angle Offset', default=0.5)
    fitting_arm_frame_thickness = FloatField('Fitting Arm Frame Thickness', default=1.5)
    tab_dimension = StringField('Tab Dimension', default="(2, 3)")
    tab_spacing_factor = FloatField('Tab Spacing Factor', default=0.5)
    recessed_edge_width = FloatField('Recessed Edge Width', default=2)
    snap_joint_overhang = FloatField('Snap Joint Overhang', default=1)
    snap_joint_face_selectors = StringField('Snap Joint Face Selectors', default="['+Y']")
    tabs_face_selector = SelectField('Tabs Face Selector',
                               choices=[('<y', '<Y'), ('>y', '>Y'), 
                                        ('x', '>X'), ('y', '<X')],
                               default='<Y')
    text_size = FloatField('Text Size', default=10)
    frame_text_size = FloatField('Frame Text Size', default=5)
    text_thickness = FloatField('Text Thickness', default=0.5)
    compartment_door_text = StringField('Compartment Door Text', default="")
    frame_text = StringField('Frame Text', default="")
    tab_tolerance = FloatField('Tab Tolerance', default=0.5)
    fitting_arm_tolerance = FloatField('Fitting Arm Tolerance', default=0.5)
    compartment_door_tolerance = FloatField('Compartment Door Tolerance', default=0.5)

class BatteryForm(FlaskForm):
    diameter = FloatField('Diameter', validators=[DataRequired()])
    length = FloatField('Length', validators=[DataRequired()])

class BatteryHolderSettingsForm(FlaskForm):
    battery = StringField('Battery', default="AAA")
    number_of_batteries = IntegerField('Number of Batteries', default=2)
    floor_thickness = FloatField('Floor Thickness', default=1.5)
    outer_wall_height = FloatField('Outer Wall Height', default=8)
    outer_wall_thickness = FloatField('Outer Wall Thickness', default=1.5)
    inner_wall_height = FloatField('Inner Wall Height', default=5)
    inner_wall_thickness = FloatField('Inner Wall Thickness', default=1.5)
    front_wall_height = FloatField('Front Wall Height', default=11)
    front_wall_thickness = FloatField('Front Wall Thickness', default=5)
    back_wall_height = FloatField('Back Wall Height', default=11)
    back_wall_thickness = FloatField('Back Wall Thickness', default=5)
    insertable_springs_thickness = FloatField('Insertable Springs Thickness', default=4)
    center_text = StringField('Center Text', default="AAA")
    text_size = FloatField('Text Size', default=5)
    text_thickness = FloatField('Text Thickness', default=0.5)
    flip_polarity = BooleanField('Flip Polarity', default=False)
    polarity_text_direction = SelectField('Polarity Text Direction',
                               choices=[ ('cut', 'Cut'), ('extrude', 'Extrude')],
                               default='Cut')
    polarity_text_spacing = FloatField('Polarity Text Spacing', default=0.4)
    battery_diameter_tolerance = FloatField('Battery Diameter Tolerance', default=1)
    battery_length_tolerance = FloatField('Battery Length Tolerance', default=1)