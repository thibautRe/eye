import { assignInlineVars } from "@vanilla-extract/dynamic"
import {
  Component,
  createContext,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js"
import { mergeStyle } from "../../utils/mergeStyle"
import { Box, BoxProps } from "../Box/Box"
import { ThemeSpaceKey, vars } from "../Styles/theme.css"
import { stack, stackD, stackA, stackJ, stackDepth, distVar } from "./Stack.css"

/**
 * In order to avoid issues with CSS variables in trees of Stacks,
 * a context is used in order to alternate the CSS variables that
 * the children should hook onto.
 */
const StackDepthContext = createContext(false)

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
  const depth = useContext(StackDepthContext)
  const pingOrPong = () => (depth ? "ping" : "pong")
  return (
    <StackDepthContext.Provider value={!depth}>
      <Box
        {...rest}
        classList={{
          [stack]: true,
          [stackD[local.d]]: true,
          [stackA[local.a]]: true,
          [stackJ[local.j]]: true,
          [stackDepth[pingOrPong()]]: true,
          ...local.classList,
        }}
        style={mergeStyle(
          local.style,
          assignInlineVars({ [distVar[pingOrPong()]]: vars.space[local.dist] }),
        )}
      />
    </StackDepthContext.Provider>
  )
}
