import { createVar, CSSProperties, style } from "@vanilla-extract/css"
import { vars } from "../Styles/theme.css"

function makePropVar<T extends keyof CSSProperties>(prop: T) {
  const v = createVar(`grid-${prop}`)
  return [v, style({ [prop]: v })] as const
}

export const [columnGapVar, columnGapGrid] = makePropVar("columnGap")
export const [rowGapVar, rowGapGrid] = makePropVar("rowGap")

export const gridS = style({
  display: "grid",
  gridTemplateRows: "repeat(auto-fill, 1fr)",
  gridTemplateColumns: "repeat(3, 1fr)",
})
