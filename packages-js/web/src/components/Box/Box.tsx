import { assignInlineVars } from "@vanilla-extract/dynamic"
import { children, Component, JSX, splitProps } from "solid-js"
import { mergeStyle } from "../../utils/mergeStyle"
import {
  ThemeColorKey,
  ThemeRadiiKey,
  ThemeSpaceKey,
  vars,
} from "../Styles/theme.css"
import * as s from "./Box.css"

export interface BoxOwnProps {
  /** background theme color */
  bgColor?: ThemeColorKey
  /** text color theme color */
  fgColor?: ThemeColorKey

  /** padding */
  p?: ThemeSpaceKey
  /** padding horizontal */
  ph?: ThemeSpaceKey
  /** padding vertical */
  pv?: ThemeSpaceKey
  /** padding left */
  pl?: ThemeSpaceKey
  /** padding right */
  pr?: ThemeSpaceKey
  /** padding top */
  pt?: ThemeSpaceKey
  /** padding bottom */
  pb?: ThemeSpaceKey

  /** border radius */
  br?: ThemeRadiiKey
}
export interface BoxProps
  extends BoxOwnProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> {
  children?:
    | JSX.Element
    | ((
        p: Pick<JSX.HTMLAttributes<Element>, "style" | "classList">,
      ) => JSX.Element)
}
export const Box: Component<BoxProps> = p => {
  const [local, rest] = splitProps(p, [
    "bgColor",
    "fgColor",
    "p",
    "pl",
    "pr",
    "pt",
    "pb",
    "pv",
    "ph",
    "br",
    "classList",
    "style",
  ])
  const pl = () => local.pl || local.ph || local.p
  const pr = () => local.pr || local.ph || local.p
  const pt = () => local.pt || local.pv || local.p
  const pb = () => local.pb || local.pv || local.p
  const classList = () => ({
    [s.bgBox]: Boolean(local.bgColor),
    [s.fgBox]: Boolean(local.fgColor),
    [s.plBox]: Boolean(pl()),
    [s.prBox]: Boolean(pr()),
    [s.ptBox]: Boolean(pt()),
    [s.pbBox]: Boolean(pb()),
    [s.brBox]: Boolean(local.br),
    ...local.classList,
  })
  const style = () =>
    mergeStyle(
      local.style,
      assignInlineVars({
        ...(local.bgColor ? { [s.bgColorVar]: vars.color[local.bgColor] } : {}),
        ...(local.fgColor ? { [s.fgColorVar]: vars.color[local.fgColor] } : {}),
        ...(pl() ? { [s.plVar]: vars.space[pl()!] } : {}),
        ...(pr() ? { [s.prVar]: vars.space[pr()!] } : {}),
        ...(pt() ? { [s.ptVar]: vars.space[pt()!] } : {}),
        ...(pb() ? { [s.pbVar]: vars.space[pb()!] } : {}),
        ...(local.br ? { [s.brVar]: vars.radii[local.br] } : {}),
      }),
    )
  // @ts-expect-error Props of children function
  const res = children(() => p.children)
  if (typeof res() === "function") {
    // @ts-expect-error res() is not a function
    return <>{res()({ ...rest, classList: classList(), style: style() })}</>
  }
  return (
    <div {...rest} classList={classList()} style={style()}>
      {res()}
    </div>
  )
}
