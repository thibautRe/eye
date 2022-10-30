import { style } from "@vanilla-extract/css"
import { vars } from "../Styles/theme.css"

export const pictureComponent = style({
  height: "100%",
  width: "100%",
  borderRadius: vars.radii.m,
})
export const pictureComponentBlurhash = style({
  position: "absolute",
  height: "100%",
  width: "100%",
  borderRadius: vars.radii.m,
})
