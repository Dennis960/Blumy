# run this file in sudo docker run -it --name freecad amrit3701/freecad-cli:0.21-amd64 bash
import os
import FreeCAD # /usr/lib/freecad/lib must be added to $PYTHONPATH
import Import

board_path = "ESPlant-Board.step"
parts_folder = "parts/"

# create folder
if not os.path.exists(parts_folder):
    os.makedirs(parts_folder)

FreeCAD.newDocument("board")
Import.insert(board_path, "board")

document = FreeCAD.getDocument("board")
parts = [part for part in document.Objects if len(part.Parents) == 0][0].OutList
# filter parts that are Parts
parts = [part for part in parts if "Part" in str(part)]
parts_data = []

for part in parts:
    part_name = part.Label
    Import.export([part], parts_folder + part_name + ".step")
    print("Exported " + part_name + ".step")
    parts_data.append({
        "name": part_name,
        "file": part_name + ".step",
        "posx": part.Placement.Base.x,
        "posy": part.Placement.Base.y,
        "posz": part.Placement.Base.z,
        "rotx": part.Placement.Rotation.Q[0],
        "roty": part.Placement.Rotation.Q[1],
        "rotz": part.Placement.Rotation.Q[2],
        "rotw": part.Placement.Rotation.Q[3],
    })

FreeCAD.closeDocument("board")

# write parts.json
import json
with open(parts_folder + "parts.json", "w") as f:
    json.dump(parts_data, f)

print("Exported parts.json")

print("Done")
