import { assignInlineVars } from "@vanilla-extract/dynamic"
import { Component, mergeProps, splitProps } from "solid-js"
import { mergeStyle } from "../../utils/mergeStyle"
import { Box, BoxProps } from "../Box/Box"
import { ThemeSpaceKey, vars } from "../Styles/theme.css"
import { stack, stackD, stackA, stackJ, stackWrap, gapVar } from "./Stack.css"

export interface StackOwnProps {
  /** direction of the Stack */
  d?: "h" | "v"
  /** distance between items */
  dist?: ThemeSpaceKey
  /** align-items */
  a?: keyof typeof stackA
  /** justify-content */
  j?: keyof typeof stackJ
  /** flex-wrap */
  wrap?: boolean
}
export interface StackProps extends StackOwnProps, BoxProps {}
export const Stack: Component<StackProps> = p => {
  const props = mergeProps({ d: "h", dist: "0", wrap: false } as const, p)
  const [local, rest] = splitProps(props, [
    "d",
    "dist",
    "a",
    "j",
    "wrap",
    "classList",
    "style",
  ])
  return (
    <Box
      {...rest}
      classList={{
        [stack]: true,
        [stackWrap]: local.wrap,
        [stackD[local.d]]: true,
        ...(local.a ? { [stackA[local.a]]: true } : {}),
        ...(local.j ? { [stackJ[local.j]]: true } : {}),
        ...local.classList,
      }}
      style={mergeStyle(
        local.style,
        assignInlineVars({ [gapVar]: vars.space[local.dist] }),
      )}
    />
  )
}
