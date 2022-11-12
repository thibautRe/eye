import { assignInlineVars } from "@vanilla-extract/dynamic"
import { Component, mergeProps, splitProps } from "solid-js"
import { mergeStyle } from "../../utils/mergeStyle"
import { Box, BoxProps } from "../Box/Box"
import { ThemeSpaceKey, vars } from "../Styles/theme.css"
import * as s from "./Grid.css"

export interface GridProps extends BoxProps {
  rowGap?: ThemeSpaceKey
  rowGapM?: ThemeSpaceKey
  columnGap?: ThemeSpaceKey
  columnGapM?: ThemeSpaceKey

  columns?: number
  columnsM?: number
}
export const Grid: Component<GridProps> = p => {
  const props = mergeProps({ columns: 3, columnsM: 2 }, p)
  const [local, rest] = splitProps(props, [
    "rowGap",
    "rowGapM",
    "columnGap",
    "columnGapM",
    "columns",
    "columnsM",

    "style",
    "classList",
  ])

  const style = () =>
    mergeStyle(
      local.style,
      assignInlineVars({
        ...{ [s.gridTemplateColumnsVar]: `${local.columns}` },
        ...{ [s.gridTemplateColumnsVarM]: `${local.columnsM}` },
        ...(local.rowGap ? { [s.rowGapVar]: vars.space[local.rowGap] } : {}),
        ...(local.rowGapM ? { [s.rowGapVarM]: vars.space[local.rowGapM] } : {}),
        ...(local.columnGap
          ? { [s.columnGapVar]: vars.space[local.columnGap] }
          : {}),
        ...(local.columnGapM
          ? { [s.columnGapVarM]: vars.space[local.columnGapM] }
          : {}),
      }),
    )
  const classList = () => ({
    [s.gridS]: true,
    [s.gridTemplateColumnsGrid]: true,
    [s.gridTemplateColumnsGridM]: true,
    [s.rowGapGrid]: Boolean(local.rowGap),
    [s.rowGapGridM]: Boolean(local.rowGapM),
    [s.columnGapGrid]: Boolean(local.columnGap),
    [s.columnGapGridM]: Boolean(local.columnGapM),
    ...local.classList,
  })
  return (
    <Box {...rest} classList={classList()} style={style()}>
      {rest.children}
    </Box>
  )
}
