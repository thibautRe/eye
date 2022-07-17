import {
  createVar,
  globalStyle,
  style,
  styleVariants,
} from "@vanilla-extract/css"

export const stack = style({ display: "flex" }, "stack")

export const stackD = styleVariants({
  h: { flexDirection: "row" },
  v: { flexDirection: "column" },
})
export const stackA = styleVariants({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
})
export const stackJ = styleVariants({
  start: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  end: { justifyContent: "flex-end" },
})

export const stackDepth = styleVariants({
  ping: {},
  pong: {},
})

export const distVar = {
  ping: createVar("stack-dist-ping"),
  pong: createVar("stack-dist-pong"),
}

globalStyle(`${stackD.h}${stackDepth.ping} > *+*`, { marginLeft: distVar.ping })
globalStyle(`${stackD.v}${stackDepth.ping} > *+*`, { marginTop: distVar.ping })

globalStyle(`${stackD.h}${stackDepth.pong} > *+*`, { marginLeft: distVar.pong })
globalStyle(`${stackD.v}${stackDepth.pong} > *+*`, { marginTop: distVar.pong })
