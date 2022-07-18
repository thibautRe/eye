import { style } from "@vanilla-extract/css"
import { vars } from "../Styles/theme.css"

export const navcontainer = style({
  minWidth: "90px",
})

export const navlink = style({
  textDecoration: "none",
  selectors: { "&.active": { color: vars.color.amber10 } },
})
