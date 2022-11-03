import { Component, mergeProps, splitProps } from "solid-js"
import { classList } from "solid-js/web"
import { Box, BoxProps } from "../Box/Box"
import * as s from "./T.css"

export const Tsizes = s.sizes
export const Tweights = s.weights

export interface TOwnProps {
  t: "xs" | "s" | "m" | "l"
  w?: "bold" | "normal"
}
export interface TProps extends TOwnProps, BoxProps {}

export const T: Component<TProps> = p => {
  const props = mergeProps({ w: "normal" as const }, p)
  const [local, rest] = splitProps(props, ["t", "w", "classList"])

  return (
    <Box
      {...rest}
      classList={{
        [s.sizes[local.t]]: true,
        [s.weights[local.w]]: true,
        ...classList,
      }}
    />
  )
}
