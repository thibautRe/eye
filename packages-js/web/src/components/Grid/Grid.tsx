import { assignInlineVars } from "@vanilla-extract/dynamic"
import { Component, splitProps } from "solid-js"
import { mergeStyle } from "../../utils/mergeStyle"
import { Box, BoxProps } from "../Box/Box"
import { ThemeSpaceKey, vars } from "../Styles/theme.css"
import * as s from "./Grid.css"

export interface GridProps extends BoxProps {
  gap?: ThemeSpaceKey
  gapRow?: ThemeSpaceKey
  gapColumn?: ThemeSpaceKey
}
export const Grid: Component<GridProps> = p => {
  const [local, rest] = splitProps(p, [
    "gap",
    "gapColumn",
    "gapRow",
    "style",
    "classList",
  ])

  const gapRow = () => local.gapRow ?? local.gap
  const gapColumn = () => local.gapColumn ?? local.gap
  const style = () =>
    mergeStyle(
      local.style,
      assignInlineVars({
        ...(gapRow() ? { [s.rowGapVar]: vars.space[gapRow()!] } : {}),
        ...(gapColumn() ? { [s.columnGapVar]: vars.space[gapColumn()!] } : {}),
      }),
    )
  const classList = () => ({
    [s.gridS]: true,
    [s.rowGapGrid]: Boolean(gapRow()),
    [s.columnGapGrid]: Boolean(gapColumn()),
    ...local.classList,
  })
  return (
    <Box {...rest} classList={classList()} style={style()}>
      {p.children}
    </Box>
  )
}
