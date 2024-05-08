import {
  createVar,
  globalStyle,
  style,
  styleVariants,
} from "@vanilla-extract/css"

export const gapVar = createVar("gap")

export const stack = style({ display: "flex", gap: gapVar }, "stack")
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
  "space-between": { justifyContent: "space-between" },
  "space-around": { justifyContent: "space-around" },
  "space-evenly": { justifyContent: "space-evenly" },
})
