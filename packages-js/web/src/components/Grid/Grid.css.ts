import { createVar, CSSProperties, style } from "@vanilla-extract/css"
import { propVarFactory } from "../Styles/propVarFactory"
import { resp, vars } from "../Styles/theme.css"

const { makePropVar, makePropVarM } = propVarFactory("grid")

export const [columnGapVar, columnGapGrid] = makePropVar("columnGap")
export const [columnGapVarM, columnGapGridM] = makePropVarM("columnGap")
export const [rowGapVar, rowGapGrid] = makePropVar("rowGap")
export const [rowGapVarM, rowGapGridM] = makePropVarM("rowGap")

export const gridS = style({
  display: "grid",
  gridTemplateRows: "repeat(auto-fill, 1fr)",

  gridTemplateColumns: "repeat(3, 1fr)",
  "@media": { [resp.m]: { gridTemplateColumns: "repeat(2, 1fr)" } },
})
