"""
MIT License

Copyright (c) 2022 Simon Dibbern

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""


import copyreg
from io import BytesIO

import cadquery as cq
import OCP


def _inflate_shape(data: bytes):
    with BytesIO(data) as bio:
        return cq.Shape.importBrep(bio)


def _reduce_shape(shape: cq.Shape):
    with BytesIO() as stream:
        shape.exportBrep(stream)
        return _inflate_shape, (stream.getvalue(),)


def _inflate_transform(*values: float):
    trsf = OCP.gp.gp_Trsf()
    trsf.SetValues(*values)
    return trsf


def _reduce_transform(transform: OCP.gp.gp_Trsf):
    return _inflate_transform, tuple(
        transform.Value(i, j) for i in range(1, 4) for j in range(1, 5)
    )


def _inflate_compound(data: bytes):
    with BytesIO(data) as bio:
        shape = OCP.TopoDS.TopoDS_Compound()
        builder = OCP.BRep.BRep_Builder()
        OCP.BRepTools.BRepTools.Read_s(shape, bio, builder)
        return shape


def _reduce_compound(compound: OCP.TopoDS.TopoDS_Compound):
    with BytesIO() as stream:
        OCP.BRepTools.BRepTools.Write_s(compound, stream)
        return _inflate_compound, (stream.getvalue(),)


def register():
    """
    Registers pickle support functions for common CadQuery and OCCT objects.
    """

    for cls in (
        cq.Edge,
        cq.Compound,
        cq.Shell,
        cq.Face,
        cq.Solid,
        cq.Vertex,
        cq.Wire,
    ):
        copyreg.pickle(cls, _reduce_shape)

    copyreg.pickle(cq.Vector, lambda vec: (cq.Vector, vec.toTuple()))
    copyreg.pickle(OCP.gp.gp_Trsf, _reduce_transform)
    copyreg.pickle(
        cq.Location, lambda loc: (cq.Location, (loc.wrapped.Transformation(),))
    )
    copyreg.pickle(OCP.TopoDS.TopoDS_Compound, _reduce_compound)


if __name__ == "__main__":
    register()
    from casemaker.casemaker import CasemakerLoader, Casemaker
    import time
    import ocp_vscode
    import pickle

    start = time.time()
    casemaker = CasemakerLoader().load_step_file(
        "/workspaces/ESPlant/ESPlant-Case/v3/parts/board.step")
    board = cq.Shape(casemaker.board_shape)
    print("loaded in " + str(time.time() - start) + "s")
    ocp_vscode.show_object(board)

    start = time.time()
    with open("board.pickle", "wb") as f:
        pickle.dump(board, f)
    print("saved in " + str(time.time() - start) + "s")

    start = time.time()
    with open("board.pickle", "rb") as f:
        board: cq.Shape = pickle.load(f)
    print("loaded in " + str(time.time() - start) + "s")
    ocp_vscode.show_object(cq.Workplane(board))

    case = Casemaker(board.wrapped, casemaker.shapes_dict).generate_board(
    ).generate_case().case.case_cq_object
    ocp_vscode.show_object(case)
