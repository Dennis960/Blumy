import os
import logging
import cadquery as cq
import json

from OCP import Bnd, IFSelect
from OCP.BRepBndLib import BRepBndLib
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TCollection import TCollection_ExtendedString
from OCP.TDataStd import TDataStd_Name
from OCP.TDF import TDF_ChildIterator, TDF_LabelSequence, TDF_Label
from OCP.TDocStd import TDocStd_Document
from OCP.TopoDS import TopoDS_Shape
from OCP.XCAFDoc import XCAFDoc_DocumentTool


def convert(
    kicad_pcb_path,
    cache_dir="parts/",
    uses_kicad_nightly_cli=True,
    force_reconvert=False,
):
    """
    Converts the kicad_pcb file to a step file and exports all parts as step files.
    Uses the kicad-cli and FreeCAD.\n
    Takes the path to the kicad_pcb file as argument.\n
    :param kicad_pcb_path: Path to the kicad_pcb file
    :param cache_dir: Path to the cache directory where the parts are saved as step files
    :param uses_kicad_nightly_cli: Whether to use kicad-cli or kica-cli-nightly
    :param force_reconvert: Whether to force reconvert the step data
    :param rerun_kicad_cli: Whether to rerun the kicad-cli command

    :return: Path to the generated board.step file
    """
    base_dir = os.path.dirname(os.path.realpath(__file__)) + "/"
    cache_dir = os.path.join(base_dir, cache_dir)

    board_path = os.path.join(cache_dir, "board.step")

    cache_already_exists = create_cache_dir(cache_dir)
    if cache_already_exists and not force_reconvert:
        logging.info("Cache already exists, skipping conversion")
        return board_path

    convert_kicad_pcb_to_step(
        kicad_pcb_path, board_path, uses_kicad_nightly_cli)

    shapes = extract_shapes_from_step_file(board_path)

    export_parts_json(shapes, cache_dir)

    logging.info("Done")
    return board_path


def create_cache_dir(cache_dir: str):
    if os.path.exists(cache_dir):
        return True
    logging.info("Creating part cache directory")
    os.makedirs(cache_dir)
    return False


def convert_kicad_pcb_to_step(kicad_pcb_path: str, step_path: str, uses_kicad_nightly_cli: bool):
    # run the command to convert the kicad_pcb file to a step file
    logging.info("Converting " + kicad_pcb_path + " to " + step_path)
    kicad_nightly_cli_cmd = f"kicad-cli-nightly pcb export step {kicad_pcb_path} --drill-origin --no-dnp --subst-models -o {step_path}"
    # --no-dnp is not supported in kicad-cli yet
    kicad_cli_cmd = f"kicad-cli pcb export step {kicad_pcb_path} --drill-origin --subst-models -o {step_path}"
    cmd = kicad_nightly_cli_cmd if uses_kicad_nightly_cli else kicad_cli_cmd
    os.system(cmd)


def extract_shapes_from_step_file(board_path: str):
    doc = TDocStd_Document(TCollection_ExtendedString("doc"))
    reader = STEPCAFControl_Reader()
    status = reader.ReadFile(board_path)
    if status != IFSelect.IFSelect_RetDone:
        logging.error(f"Error reading file {board_path}")
        exit()

    reader.Transfer(doc)
    shapeTool = XCAFDoc_DocumentTool.ShapeTool_s(doc.Main())

    shapes: dict[str, TopoDS_Shape] = {}
    freeShapes = TDF_LabelSequence()
    shapeTool.GetFreeShapes(freeShapes)
    if freeShapes.Length() != 1:
        logging.error(f"Expected 1 free shape, found {freeShapes.Length()}")
        exit()

    tdf_iterator = TDF_ChildIterator(freeShapes.Value(1))
    while tdf_iterator.More():
        label = tdf_iterator.Value()
        tdf_iterator.Next()
        if shapeTool.IsShape_s(label):
            shape = shapeTool.GetShape_s(label)

            refLabel = TDF_Label()
            nameAttr = TDataStd_Name()
            if shapeTool.GetReferredShape_s(label, refLabel):
                if refLabel.FindAttribute(TDataStd_Name.GetID_s(), nameAttr):
                    name = nameAttr.Get().ToExtString()

            newName = name
            i = 1
            while newName in shapes:
                newName = name + f" ({i})"
                i += 1
            shapes[newName] = shape
        else:
            logging.info(f"Label {label} is not a shape")
    return shapes

def export_parts_json(shapes: dict[str, TopoDS_Shape], cache_dir: str):
    parts_data = []
    for name, shape in shapes.items():
        transformation = shape.Location().Transformation()
        translation = transformation.TranslationPart()
        rotation = transformation.GetRotation()
        boundingBox = Bnd.Bnd_Box()
        BRepBndLib.Add_s(shape, boundingBox)
        xmin, ymin, zmin, xmax, ymax, zmax = boundingBox.Get()
        cq.Assembly(cq.Workplane(cq.Shape.cast(shape))).save(os.path.join(cache_dir, name + ".step"))
        parts_data.append(
            {
                "name": name,
                "file": name + ".step",
                "posx": translation.X(),
                "posy": translation.Y(),
                "posz": translation.Z(),
                "rotx": rotation.X(),
                "roty": rotation.Y(),
                "rotz": rotation.Z(),
                "rotw": rotation.W(),
                "sizex": xmax - xmin,
                "sizey": ymax - ymin,
                "sizez": zmax - zmin,
            }
        )

    with open(os.path.join(cache_dir, "parts.json"), "w") as f:
        json.dump(parts_data, f)

    logging.info("Exported parts.json")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    convert("ESPlant-Board/ESPlant-Board.kicad_pcb", force_reconvert=True)
