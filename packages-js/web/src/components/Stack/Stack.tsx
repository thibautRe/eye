import { Component, mergeProps, ParentComponent, splitProps } from "solid-js"
import { mergeStyle } from "../../utils/mergeStyle"
import { Box, BoxProps } from "../Box/Box"
import { ThemeSpaceKey, vars } from "../Styles/theme.css"
import { stack, stackD, stackA, stackJ, varDistName } from "./Stack.css"

export interface StackOwnProps {
  /** direction of the Stack */
  d?: "h" | "v"
  /** distance between items */
  dist?: ThemeSpaceKey
  /** align-items */
  a?: "start" | "center" | "end"
  /** justify-content */
  j?: "start" | "center" | "end"
}
export interface StackProps extends StackOwnProps, BoxProps {}
export const Stack: Component<StackProps> = p => {
  const props = mergeProps(
    { d: "h", dist: "0", a: "center", j: "start" } as const,
    p,
  )
  const [local, rest] = splitProps(props, [
    "d",
    "dist",
    "a",
    "j",
    "classList",
    "style",
  ])
  return (
    <Box
      {...rest}
      classList={{
        [stack]: true,
        [stackD[local.d]]: true,
        [stackA[local.a]]: true,
        [stackJ[local.j]]: true,
        ...local.classList,
      }}
      style={mergeStyle(local.style, { [varDistName]: vars.space[local.dist] })}
    />
  )
}
