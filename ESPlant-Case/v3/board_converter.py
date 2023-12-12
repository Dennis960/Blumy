import os
import logging

from OCP import IFSelect
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
    # It should be unique, so that it doesn't conflict with other parts
    board_name="__B$O$A$R$D__",
) -> dict[str, TopoDS_Shape]:
    """
    Converts the kicad_pcb file to a step file and loads the individual components as TopoDS_Shape into a dictionary.\n
    :param kicad_pcb_path: Path to the kicad_pcb file
    :param cache_dir: Path to the cache directory where the board is saved as step file
    :param uses_kicad_nightly_cli: Whether to use kicad-cli or kica-cli-nightly
    :param force_reconvert: Whether to force reconvert the step data
    :param board_name: Name of the board shape

    :return: A dictionary of names and TopoDS_Shape objects. The board is saved with name board_name.
    """
    base_dir = os.path.dirname(os.path.realpath(__file__)) + "/"
    cache_dir = os.path.join(base_dir, cache_dir)

    board_path = os.path.join(cache_dir, "board.step")

    cache_already_exists = create_cache_dir(cache_dir)
    if not cache_already_exists or force_reconvert:
        convert_kicad_pcb_to_step(
            kicad_pcb_path, board_path, uses_kicad_nightly_cli)

    return extract_shapes_from_step_file(board_path, board_name)


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


def extract_shapes_from_step_file(board_path: str, board_name: str):
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
    shapes[board_name] = shapeTool.GetShape_s(freeShapes.Value(1))

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


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    convert("ESPlant-Board/ESPlant-Board.kicad_pcb", force_reconvert=True)
