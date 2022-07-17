import { globalStyle, style, styleVariants } from "@vanilla-extract/css"

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

export const varDistName = `--stack-dist`
const varDist = `var(${varDistName})`
globalStyle(`${stackD.h} > *+*`, { marginLeft: varDist })
globalStyle(`${stackD.v} > *+*`, { marginTop: varDist })
