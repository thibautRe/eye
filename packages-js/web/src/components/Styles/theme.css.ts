import { createTheme, style } from "@vanilla-extract/css"

const defaultTheme = {
  color: {
    brand: "blue",
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
}

export type Theme = typeof defaultTheme
export type ThemeSpace = Theme["space"]
export type ThemeSpaceKey = keyof ThemeSpace

export const [themeClass, vars] = createTheme(defaultTheme)
