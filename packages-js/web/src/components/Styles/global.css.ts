import { globalStyle } from "@vanilla-extract/css"
import { vars } from "./theme.css"

globalStyle("html, body", {
  margin: 0,
})

globalStyle("*, *::before, *::after", {
  boxSizing: "inherit",
})

globalStyle("body", {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  WebkitFontSmoothing: "antialised",
  MozOsxFontSmoothing: "grayscale",
  boxSizing: "border-box",

  background: vars.color.g1,
  color: vars.color.g12,
})

globalStyle("ul", {
  margin: 0,
  padding: 0,
  listStyle: "none",
})
