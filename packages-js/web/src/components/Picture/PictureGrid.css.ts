import { style } from "@vanilla-extract/css"
import { vars } from "../Styles/theme.css"

export const gridComponent = style({
  display: "grid",
  gridTemplateRows: "repeat(auto-fill, 1fr)",
  gridTemplateColumns: "repeat(3, 1fr)",
  columnGap: vars.space.l,
  rowGap: vars.space.l,
})
