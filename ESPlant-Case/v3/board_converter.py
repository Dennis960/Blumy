# run this file in sudo docker run -it --name freecad amrit3701/freecad-cli:0.21-amd64 bash
import os
import FreeCAD # /usr/lib/freecad/lib must be added to $PYTHONPATH
import Import
import logging

def convert(kicad_pcb_path, cache_dir = "parts/", uses_kicad_nightly_cli = True, force_reconvert = False):
    """
    Converts the kicad_pcb file to a step file and exports all parts as step files.
    Uses the kicad-cli and FreeCAD.\n
    Takes the path to the kicad_pcb file as argument.\n
    :param kicad_pcb_path: Path to the kicad_pcb file
    :param cache_dir: Path to the cache directory where the parts are saved as step files
    :param uses_kicad_nightly_cli: Whether to use kicad-cli or kica-cli-nightly

    :return: Path to the generated board.step file
    """
    base_dir = os.path.dirname(os.path.realpath(__file__)) + "/"
    cache_dir = os.path.join(base_dir, cache_dir)

    board_path = os.path.join(cache_dir, "board.step")
    kicad_nightly_cli_cmd = f"kicad-cli-nightly pcb export step {kicad_pcb_path} --drill-origin --no-dnp --subst-models -o {board_path}"
    kicad_cli_cmd = f"kicad-cli pcb export step {kicad_pcb_path} --drill-origin --subst-models -o {board_path}" # --no-dnp is not supported in kicad-cli yet
    cmd = kicad_nightly_cli_cmd if uses_kicad_nightly_cli else kicad_cli_cmd

    # create folder
    if not os.path.exists(cache_dir):
        logging.info("Creating part cache directory")
        os.makedirs(cache_dir)
    else:
        if not force_reconvert:
            logging.info("Already converted")
            return board_path
        else:
            logging.info("Converting again")
        
    # run the command to convert the kicad_pcb file to a step file
    logging.info("Converting " + kicad_pcb_path + " to " + board_path)
    os.system(cmd)

    FreeCAD.newDocument("board")
    Import.insert(board_path, "board")

    document = FreeCAD.getDocument("board")
    parts = [part for part in document.Objects if len(part.Parents) == 0][0].OutList
    # filter parts that are Parts
    parts = [part for part in parts if "Part" in str(part)]
    parts_data = []

    for part in parts:
        part_name = part.Label
        Import.export([part], cache_dir + part_name + ".step")
        logging.info("Exported " + part_name + ".step")
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
    with open(cache_dir + "parts.json", "w") as f:
        json.dump(parts_data, f)

    logging.info("Exported parts.json")
    logging.info("Done")
    return board_path
