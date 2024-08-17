// FIXME workaround for Node 20 bug
// https://github.com/TypeStrong/ts-node/issues/2026#issuecomment-1724327142
import { setUncaughtExceptionCaptureCallback } from "node:process"
setUncaughtExceptionCaptureCallback(console.log)