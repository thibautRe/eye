import { style } from "@vanilla-extract/css"
import { vars } from "../../Styles/theme.css"

export const sidebar = style({
  position: "absolute",
  top: vars.space.m,
  right: vars.space.m,
  bottom: vars.space.m,
  width: 390,
  boxShadow: `
    0px 0.7px 7.2px rgba(0, 0, 0, 0.16),
    0px 1.7px 12.1px rgba(0, 0, 0, 0.111),
    0px 3.1px 15.6px rgba(0, 0, 0, 0.086),
    0px 5.6px 18.9px rgba(0, 0, 0, 0.067),
    0px 10.4px 23.8px rgba(0, 0, 0, 0.049),
    0px 25px 40px rgba(0, 0, 0, 0.031)`,
})
