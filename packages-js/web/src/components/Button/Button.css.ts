import { style } from "@vanilla-extract/css"
import { vars } from "../Styles/theme.css"

export const button = style({
  appearance: "none",
  border: "none",
  minWidth: "120px",
  textAlign: "center",

  fontFamily: "inherit",

  paddingTop: vars.space.s,
  paddingBottom: vars.space.s,
  paddingLeft: vars.space.m,
  paddingRight: vars.space.m,

  background: vars.color.p4,
  color: vars.color.p12,

  borderRadius: vars.radii.m,
  cursor: "pointer",

  ":hover": { background: vars.color.p5 },
  ":active": { background: vars.color.p6 },

  ":disabled": {
    cursor: "default",
    background: vars.color.g8,
    color: vars.color.g6,
  },
})
