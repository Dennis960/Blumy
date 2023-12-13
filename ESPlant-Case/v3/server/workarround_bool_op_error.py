import cadquery as cq
_bool_op = cq.Shape._bool_op


def _bool_op_no_parallel(self, args, tools, op, parallel = True):
    return _bool_op(self, args, tools, op, False)


cq.Shape._bool_op = _bool_op_no_parallel
