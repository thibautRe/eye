import { createVar, style } from "@vanilla-extract/css"

export const aspectRatioVar = createVar("aspect-ratio")

export const aspectRatioC = style({
  display: "block",
  position: "relative",
  height: 0,
  width: "100%",
  paddingBottom: aspectRatioVar,
})

export const aspectRatioInnerC = style({
  display: "block",
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  height: "100%",
  width: "100%",
})
