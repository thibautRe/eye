import { Component, mergeProps, splitProps } from "solid-js"
import { classList } from "solid-js/web"
import { Box, BoxProps } from "../Box/Box"
import * as s from "./T.css"

export interface TOwnProps {
  t: "xs" | "s" | "m"
  w?: "bold" | "normal"
}
export interface TProps extends TOwnProps, BoxProps {}

export const T: Component<TProps> = p => {
  const props = mergeProps({ w: "normal" }, p)
  const [local, rest] = splitProps(props, ["t", "w", "classList"])

  return <Box {...rest} classList={{ [s[local.t]]: true, ...classList }} />
}
