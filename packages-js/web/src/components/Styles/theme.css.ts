import { createGlobalTheme, createTheme, style } from "@vanilla-extract/css"

const defaultTheme = {
  color: {
    // Greys (taken from the "grayDark" scale from Radix)
    // see: https://www.radix-ui.com/docs/colors/palette-composition/the-scales
    /** App background */
    g1: "hsl(0, 0%, 8.5%)",
    /** Subtle background */
    g2: "hsl(0, 0%, 11.0%)",
    /** UI element background */
    g3: "hsl(0, 0%, 13.6%)",
    /** Hovered UI element background */
    g4: "hsl(0, 0%, 15.8%)",
    /** Active / Selected UI element background */
    g5: "hsl(0, 0%, 17.9%)",
    /** Subtle borders and separators */
    g6: "hsl(0, 0%, 20.5%)",
    /** UI element border and focus rings */
    g7: "hsl(0, 0%, 24.3%)",
    /** Hovered UI element border */
    g8: "hsl(0, 0%, 31.2%)",
    /** Solid backgrounds */
    g9: "hsl(0, 0%, 43.9%)",
    /** 	Hovered solid backgrounds */
    g10: "hsl(0, 0%, 49.4%)",
    /** 	Low-contrast text */
    g11: "hsl(0, 0%, 62.8%)",
    /** 	High-contrast text */
    g12: "hsl(0, 0%, 93.0%)",

    // Primary color taken from "AmberDark" scale from Radix Colors
    p1: "hsl(36, 100%, 6.1%)",
    p2: "hsl(35, 100%, 7.6%)",
    p3: "hsl(32, 100%, 10.2%)",
    p4: "hsl(32, 100%, 12.4%)",
    p5: "hsl(33, 100%, 14.6%)",
    p6: "hsl(35, 100%, 17.1%)",
    p7: "hsl(35, 91.0%, 21.6%)",
    p8: "hsl(36, 100%, 25.5%)",
    p9: "hsl(39, 100%, 57.0%)",
    p10: "hsl(43, 100%, 64.0%)",
    p11: "hsl(39, 90.0%, 49.8%)",
    p12: "hsl(39, 97.0%, 93.2%)",
  },
  space: {
    /** 2.5rem */
    xl: "2.5rem",
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

export const breakpoints = {
  m: 768,
}
export const resp = {
  m: `screen and (max-width: ${breakpoints.m}px)`,
}
