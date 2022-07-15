import { globalStyle, style, styleVariants } from "@vanilla-extract/css"

const stack = style(
  {
    display: "flex",

    // Useful reset if the stack is being used as a "ul" element
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  "stack",
)

export const stackD = styleVariants({
  h: [stack, { flexDirection: "row" }],
  v: [stack, { flexDirection: "column" }],
})

export const varDistName = `--stack-dist`
const varDist = `var(${varDistName})`
globalStyle(`${stackD.h} > *+*`, { marginLeft: varDist })
globalStyle(`${stackD.v} > *+*`, { marginTop: varDist })
