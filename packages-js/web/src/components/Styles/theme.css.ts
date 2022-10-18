import { createGlobalTheme, createTheme, style } from "@vanilla-extract/css"

const defaultTheme = {
  color: {
    // Greys (taken from the "mauve" scale from Radix)
    // see: https://www.radix-ui.com/docs/colors/palette-composition/the-scales
    /** App background */
    g1: "hsl(300, 20.0%, 99.0%)",
    /** Subtle background */
    g2: "hsl(300, 7.7%, 97.5%)",
    /** UI element background */
    g3: "hsl(294, 5.5%, 95.3%)",
    /** Hovered UI element background */
    g4: "hsl(289, 4.7%, 93.3%)",
    /** Active / Selected UI element background */
    g5: "hsl(283, 4.4%, 91.3%)",
    /** Subtle borders and separators */
    g6: "hsl(278, 4.1%, 89.1%)",
    /** UI element border and focus rings */
    g7: "hsl(271, 3.9%, 86.3%)",
    /** Hovered UI element border */
    g8: "hsl(255, 3.7%, 78.8%)",
    /** Solid backgrounds */
    g9: "hsl(252, 4.0%, 57.3%)",
    /** 	Hovered solid backgrounds */
    g10: "hsl(253, 3.5%, 53.5%)",
    /** 	Low-contrast text */
    g11: "hsl(252, 4.0%, 44.8%)",
    /** 	High-contrast text */
    g12: "hsl(260, 25.0%, 11.0%)",

    // Ambers https://www.radix-ui.com/docs/colors/palette-composition/the-scales#amber
    amber1: "hsl(39, 70.0%, 99.0%)",
    amber2: "hsl(40, 100%, 96.5%)",
    amber3: "hsl(44, 100%, 91.7%)",
    amber4: "hsl(43, 100%, 86.8%)",
    amber5: "hsl(42, 100%, 81.8%)",
    amber6: "hsl(38, 99.7%, 76.3%)",
    amber7: "hsl(36, 86.1%, 67.1%)",
    amber8: "hsl(35, 85.2%, 55.1%)",
    amber9: "hsl(39, 100%, 57.0%)",
    amber10: "hsl(35, 100%, 55.5%)",
    amber11: "hsl(30, 100%, 34.0%)",
    amber12: "hsl(20, 80.0%, 17.0%)",
  },
  space: {
    /** 1.5rem */
    l: "1.5rem",
    /** 1rem */
    m: "1rem",
    /** 0.5rem */
    s: "0.5rem",
    /** 0.25rem */
    xs: "0.25rem",
    /** 0.125rem */
    xxs: "0.125rem",

    "0": "0rem",
  },
  radii: {
    "0": "0",
    /** 6px */
    m: "6px",
    /** 20px */
    l: "20px",
  },
}

export type Theme = typeof defaultTheme
export type ThemeSpace = Theme["space"]
export type ThemeColor = Theme["color"]
export type ThemeRadii = Theme["radii"]
export type ThemeSpaceKey = keyof ThemeSpace
export type ThemeColorKey = keyof ThemeColor
export type ThemeRadiiKey = keyof ThemeRadii

export const vars = createGlobalTheme(":root", defaultTheme)
