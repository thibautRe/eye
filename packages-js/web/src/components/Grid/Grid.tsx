import { assignInlineVars } from "@vanilla-extract/dynamic"
import { Component, splitProps } from "solid-js"
import { mergeStyle } from "../../utils/mergeStyle"
import { Box, BoxProps } from "../Box/Box"
import { ThemeSpaceKey, vars } from "../Styles/theme.css"
import * as s from "./Grid.css"

export interface GridProps extends BoxProps {
  rowGap?: ThemeSpaceKey
  columnGap?: ThemeSpaceKey
}
export const Grid: Component<GridProps> = p => {
  const [local, rest] = splitProps(p, [
    "columnGap",
    "rowGap",
    "style",
    "classList",
  ])

  const style = () =>
    mergeStyle(
      local.style,
      assignInlineVars({
        ...(local.rowGap ? { [s.rowGapVar]: vars.space[local.rowGap] } : {}),
        ...(local.columnGap
          ? { [s.columnGapVar]: vars.space[local.columnGap] }
          : {}),
      }),
    )
  const classList = () => ({
    [s.gridS]: true,
    [s.rowGapGrid]: Boolean(local.rowGap),
    [s.columnGapGrid]: Boolean(local.columnGap),
    ...local.classList,
  })
  return (
    <Box {...rest} classList={classList()} style={style()}>
      {p.children}
    </Box>
  )
}
