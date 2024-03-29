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
import {
  stack,
  stackD,
  stackA,
  stackJ,
  stackDepth,
  stackWrap,
  distVar,
} from "./Stack.css"

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
  const depth = useContext(StackDepthContext)
  const pingOrPong = () => (depth ? "ping" : "pong")
  return (
    <StackDepthContext.Provider value={!depth}>
      <Box
        {...rest}
        classList={{
          [stack]: true,
          [stackWrap]: local.wrap,
          [stackD[local.d]]: true,
          [stackDepth[pingOrPong()]]: true,
          ...(local.a ? { [stackA[local.a]]: true } : {}),
          ...(local.j ? { [stackJ[local.j]]: true } : {}),
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
