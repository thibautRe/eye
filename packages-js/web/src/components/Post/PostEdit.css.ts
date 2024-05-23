import { style } from "@vanilla-extract/css"
import { vars } from "../Styles/theme.css"

export const input = style({
  maxWidth: "100%",

  background: vars.color.g3,
  color: vars.color.g12,
  border: 0,
})

export const textarea = style({
  maxWidth: "100%",
  minHeight: 650,

  background: vars.color.g3,
  color: vars.color.g12,
  border: 0,

  resize: "vertical",
})
