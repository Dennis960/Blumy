from kikit import panelize_ui_impl as ki
from kikit.fab import jlcpcb
from kikit.units import mm, deg
from kikit.panelize import Panel
from pcbnewTransition.pcbnew import LoadBoard
from itertools import chain

# Custom config
input = "ESPlant-Board/ESPlant-Board.kicad_pcb"
output = "ESPlant-Board-Panel/panel.kicad_pcb"

# KiKit Panel Config (Only deviations from default)

layout = {
    "hspace": "2mm",
    "vspace": "2mm",
    "cols": "5"
}
source = {
    "tolerance": "15mm"
}
tabs = {
    "type": "annotation",
    "tabfootprints": "CustomFootprints:MouseBites5mm",
    "vwidth": "5mm",
    "hwidth": "5mm",
    "vcount": "0"
}
cuts = {
    "type": "mousebites",
    "drill": "0.6mm",
    "spacing": "1mm",
    "offset": "-0.3mm"
}
framing = {
    "type": "railslr",
    "vspace": "5mm",
}
tooling = {
    "type": "4hole",
    "hoffset": "2.5mm",
    "voffset": "2.5mm",
    "size": "1.152mm"
}
fiducials = {
    "type": "4fid",
    "hoffset": "4mm",
    "voffset": "8mm",
    "opening": "2mm"
}
text = {
    "type": "simple",
    "hoffset": "2mm",
    "vjustify": "left",
    "orientation": "90deg",
    "text": "JLCJLCJLCJLC",
    "anchor": "ml"
}
post = {
    "dimensions": "True"
}
board = LoadBoard(input)
panel = Panel(output)


# Obtain full config by combining above with default
preset = ki.obtainPreset([], layout=layout, tabs=tabs, cuts=cuts, framing=framing,
                         tooling=tooling, fiducials=fiducials, text=text, post=post)


# Register extra footprints for annotations
for tabFootprint in preset["tabs"]["tabfootprints"]:
    panel.annotationReader.registerTab(tabFootprint.lib, tabFootprint.footprint)

panel.inheritDesignSettings(board)
panel.inheritProperties(board)
panel.inheritTitleBlock(board)

sourceArea = ki.readSourceArea(preset["source"], board)
substrates, framingSubstrates, backboneCuts = \
    ki.buildLayout(preset, panel, input, sourceArea)

tabCuts = ki.buildTabs(preset, panel, substrates, framingSubstrates)

frameCuts = ki.buildFraming(preset, panel)

ki.buildTooling(preset, panel)
ki.buildFiducials(preset, panel)
for textSection in ["text", "text2", "text3", "text4"]:
    ki.buildText(preset[textSection], panel)
ki.buildPostprocessing(preset["post"], panel)

ki.makeTabCuts(preset, panel, tabCuts)
ki.makeOtherCuts(preset, panel, chain(backboneCuts, frameCuts))

ki.buildCopperfill(preset["copperfill"], panel)

ki.setStackup(preset["source"], panel)
ki.setPageSize(preset["page"], panel, board)
ki.positionPanel(preset["page"], panel)

ki.runUserScript(preset["post"], panel)

ki.buildDebugAnnotation(preset["debug"], panel)

panel.save(reconstructArcs=preset["post"]["reconstructarcs"],
            refillAllZones=preset["post"]["refillzones"])

footprints = panel.board.Footprints()
for footprint in footprints:
    reference = footprint.GetReference()
    if "KiKit_" in str(reference):
        footprint.SetExcludedFromBOM(True)
        footprint.SetExcludedFromPosFiles(True)


panel.save(reconstructArcs=preset["post"]["reconstructarcs"],
           refillAllZones=preset["post"]["refillzones"])
