import { JSX } from "solid-js/jsx-runtime"

const styleStringToProp = (styleString: string): JSX.CSSProperties =>
  Object.fromEntries(
    styleString.split(";").map(rule => rule.split(":").map(s => s.trim())),
  )
const styleToProp = (
  style: JSX.CSSProperties | string | undefined,
): JSX.CSSProperties =>
  typeof style === "object" ? style : !style ? {} : styleStringToProp(style)

/** Utility to merge Solid's dual `style` prop */
export const mergeStyle = (
  ...styles: (JSX.CSSProperties | string | undefined)[]
): JSX.CSSProperties =>
  styles.map(styleToProp).reduce((a, b) => ({ ...a, ...b }), {})

/**
 * Transforms a `classList` prop to a `class` one
 * @deprecated this is only used until https://github.com/solidjs/solid-app-router/pull/139 is fixed
 */
export const classListToClass = (
  classList?: Record<string, boolean | undefined>,
): string =>
  classList
    ? Object.entries(classList)
        .filter(([_, val]) => val)
        .map(([key]) => key)
        .join(" ")
    : ``
