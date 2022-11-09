import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "../../Styles/theme.css"

export const wrapper = style({
  position: "fixed",
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: 1,

  backgroundColor: vars.color.g4,

  transition: "transform 0.2s ease-in-out",
  transform: "translateX(-100%)",
})

export const wrapperOpen = style({ transform: "none" })

export const triggerWrapper = style({
  position: "absolute",
  top: 200,
  right: 0,
  height: 0,
  transform: "rotate(90deg)",
})
export const trigger = style({
  transform: "translateY(-81px)",
  width: "110px",
  paddingTop: vars.space.s,
  paddingBottom: vars.space.s,
  borderRadius: `${vars.radii.m} ${vars.radii.m} 0 0`,
  backgroundColor: vars.color.g4,
  textAlign: "center",
  cursor: "pointer",

  ":hover": {
    backgroundColor: vars.color.g5,
  },
})
