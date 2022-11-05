import {
  createVar,
  globalStyle,
  style,
  styleVariants,
} from "@vanilla-extract/css"

export const stack = style({ display: "flex" }, "stack")
export const stackWrap = style({ flexWrap: "wrap" })

export const stackD = styleVariants({
  h: { flexDirection: "row" },
  v: { flexDirection: "column" },
})
export const stackA = styleVariants({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
  stretch: { alignItems: "stretch" },
  baseline: { alignItems: "baseline" },
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

type StackD = keyof typeof stackD
type StackDepth = keyof typeof stackDepth
const makeSel = (d: StackD, depth: StackDepth) =>
  `${stackD[d]}${stackDepth[depth]}`

globalStyle(makeSel("h", "ping"), { rowGap: distVar.ping })
globalStyle(makeSel("h", "pong"), { rowGap: distVar.pong })

const makeSelChild = (d: StackD, depth: StackDepth) =>
  `${makeSel(d, depth)} > :not(:last-child)`
globalStyle(makeSelChild("h", "ping"), { marginRight: distVar.ping })
globalStyle(makeSelChild("h", "pong"), { marginRight: distVar.pong })
globalStyle(makeSelChild("v", "ping"), { marginBottom: distVar.ping })
globalStyle(makeSelChild("v", "pong"), { marginBottom: distVar.pong })
