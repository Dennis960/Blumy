from sexpdata import loads, dumps, Symbol
import os
from typing import TypedDict
import logging


class AvailableModel(TypedDict):
    name: str
    rel_path: str
    abs_path: str


class SexpModel(TypedDict):
    name: str
    path: str
    footprint_index: int
    model_index: int


# TODO run this function once when starting the container and save the result in a file
def load_list_of_available_3d_models(use_kicad_nightly: bool = True):
    models: list[TypedDict] = []
    try:
        kicad_3d_model_dir = f"/usr/share/kicad{'-nightly' if use_kicad_nightly else ''}/3dmodels"
        model_dirs = os.listdir(kicad_3d_model_dir)
        for model_dir in model_dirs:
            if not os.path.isdir(os.path.join(kicad_3d_model_dir, model_dir)):
                continue
            files = os.listdir(os.path.join(kicad_3d_model_dir, model_dir))
            for file in files:
                if not (file.endswith(".wrl") or file.endswith(".step")):
                    continue
                models.append({
                    "name": file,
                    "rel_path": os.path.join(model_dir, file),
                    "abs_path": os.path.join(kicad_3d_model_dir, model_dir, file)
                })
    except Exception as e:
        logging.error("Could not load KiCad 3D models")
        logging.error(e)
    return models


available_models = load_list_of_available_3d_models()


def parse_kicad_pcb(filepath) -> list[SexpModel]:
    with open(filepath, "r") as f:
        data = f.read()
    data = loads(data)
    models: list[SexpModel] = []
    for i, symbol in enumerate(data):
        try:
            if not isinstance(symbol, list):
                continue
            if not isinstance(symbol[0], Symbol):
                continue
            if symbol[0].value() == "footprint":
                name: str = symbol[1]
                model_path = None
                footprint_index = i
                model_index = None
                for j, fp_symbol in enumerate(symbol):
                    if not isinstance(fp_symbol, list):
                        continue
                    if not isinstance(fp_symbol[0], Symbol):
                        continue
                    if fp_symbol[0].value() == "model":
                        model_path = fp_symbol[1]
                        model_index = j
                        break
                if model_path is None:
                    continue
                models.append({
                    "name": name,
                    "path": model_path,
                    "footprint_index": footprint_index,
                    "model_index": model_index
                })
        except:
            logging.error(
                f"Could not parse KiCad PCB {filepath} at index {i} {symbol} {type(symbol)}")
    return models


def find_missing_models_in_kicad_pcb(kicad_pcb_abs_path: str) -> list[SexpModel]:
    models = parse_kicad_pcb(kicad_pcb_abs_path)
    missing_models: list[SexpModel] = []
    for model in models:
        print(model)
        if not any((m["rel_path"] in model["path"]) for m in available_models):
            missing_models.append(model)
    logging.info(f"Found {len(missing_models)} missing models")
    return missing_models


def update_kicad_pcb_with_new_models(kicad_pcb_abs_path: str, missing_models: list[SexpModel], new_kicad_pcb_abs_path: str = None) -> str:
    if missing_models == []:
        logging.info("No missing models, nothing to do")
        return kicad_pcb_abs_path
    try:
        if new_kicad_pcb_abs_path is None:
            new_kicad_pcb_abs_path = kicad_pcb_abs_path.replace(
                ".kicad_pcb", "_new.kicad_pcb")
        with open(kicad_pcb_abs_path, "r") as f:
            data = f.read()
        data = loads(data)
        for missing_model in missing_models:
            fi = missing_model["footprint_index"]
            mi = missing_model["model_index"]
            path = missing_model["path"]
            data[fi][mi][1] = path

        with open(new_kicad_pcb_abs_path, "w") as f:
            f.write(dumps(data))
        return new_kicad_pcb_abs_path
    except Exception as e:
        logging.error("Could not update KiCad PCB")
        logging.error(e)
        return kicad_pcb_abs_path


if __name__ == "__main__":
    test_kicad_pcb_path = "/workspaces/ESPlant/ESPlant-Board/ESPlant-Board.kicad_pcb"

    missing_models = find_missing_models_in_kicad_pcb(test_kicad_pcb_path)
    print(f"Could not load models for: {missing_models}")
    for missing_model in missing_models:
        # Get the new path here
        new_path = "/app/casemaker/43057230957234/upload/model/NewModel.step"
        missing_model["path"] = new_path
    new_kicad_pcb_path = update_kicad_pcb_with_new_models(
        test_kicad_pcb_path, missing_models)
