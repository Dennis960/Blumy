from wtforms import StringField, DecimalField, SelectField, SelectMultipleField
from wtforms.fields import FieldList
from wtforms.widgets import ListWidget, TextInput, NumberInput, html_params

class BootstrapNumberInput(NumberInput):
    def __call__(self, field, **kwargs):
        kwargs.setdefault('class', 'form-control')
        return super(BootstrapNumberInput, self).__call__(field, **kwargs)

class BootstrapDecimalField(DecimalField):
    widget = BootstrapNumberInput(step="any")

class BootstrapTextInput(TextInput):
    def __call__(self, field, **kwargs):
        kwargs.setdefault('class', 'form-control')
        return super(BootstrapTextInput, self).__call__(field, **kwargs)

class BootstrapStringField(StringField):
    widget = BootstrapTextInput()

class BootstrapVectorInput(ListWidget):
    def __call__(self, field, **kwargs):
        kwargs.setdefault("id", field.id)
        html = ['<div class="input-group" %s>' % html_params(**kwargs)]
        for subfield, coordinate in zip(field, ['X', 'Y', 'Z']):
            html.append(f'<span class="input-group-text">{coordinate}</span>')
            html.append(subfield())
        html.append('</div>')
        return ''.join(html)

class BootstrapVectorField(FieldList):
    widget = BootstrapVectorInput()

    def __init__(self, label=None, validators=None, default=(), **kwargs):
        super(BootstrapVectorField, self).__init__(BootstrapDecimalField(validators=validators),
                                                   label=label,
                                                   min_entries=3,
                                                   max_entries=3,
                                                   default=default,
                                                   **kwargs)

class SelectPCBPartField(SelectField):
    pass

class SelectMultiplePCBPartField(SelectMultipleField):
    pass
