import { style } from "@vanilla-extract/css"
import { vars } from "../Styles/theme.css"

export const picture = style({
  position: "relative",
  height: "100%",
  width: "100%",
  borderRadius: vars.radii.m,
  objectFit: "cover",
  transition: `opacity 0.2s, mix-blend-mode 0.2s, filter 0.2s`,
})
export const pictureLoading = style({
  opacity: 0.4,
  mixBlendMode: "multiply",
  filter: `saturate(0.5) contrast(120%)`,
})

export const blurhash = style({
  position: "absolute",
  height: "100%",
  width: "100%",
  borderRadius: vars.radii.m,
})
