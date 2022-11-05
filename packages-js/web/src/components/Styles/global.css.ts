import { globalFontFace, globalStyle } from "@vanilla-extract/css"
import { vars } from "./theme.css"

// https://fonts.google.com/specimen/Albert+Sans
globalFontFace("AlbertSans", {
  src: `url("/src/assets/AlbertSans-Regular.woff2") format("woff2"),
        url("/src/assets/AlbertSans-Regular.woff") format("woff")`,
  fontWeight: 400,
})
globalFontFace("AlbertSans", {
  src: `url("/src/assets/AlbertSans-SemiBold.woff2") format("woff2"),
        url("/src/assets/AlbertSans-SemiBold.woff") format("woff")`,
  fontWeight: 600,
})

globalStyle("html, body", {
  margin: 0,
  fontFamily: "AlbertSans",
})

globalStyle("*, *::before, *::after", {
  boxSizing: "inherit",
})

globalStyle("*:focus-visible", {
  outlineStyle: "solid",
  outlineWidth: 2,
  outlineColor: vars.color.p11,
  outlineOffset: vars.space.xxs,
})

globalStyle("body", {
  MozOsxFontSmoothing: "grayscale",
  boxSizing: "border-box",
  overflowY: "scroll",

  background: vars.color.g1,
  color: vars.color.g12,
})

globalStyle("ul", {
  margin: 0,
  padding: 0,
  listStyle: "none",
})

globalStyle("h1, h2, h3, h4, h5, h6", {
  margin: 0,
})

globalStyle("a", {
  textDecoration: "none",
})
