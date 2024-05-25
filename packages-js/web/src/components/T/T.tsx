import { Component, splitProps } from "solid-js"
import { classList } from "solid-js/web"
import { Box, BoxProps } from "../Box/Box"
import * as s from "./T.css"

export const Tsizes = s.sizes
export const Tweights = s.weights

export interface TOwnProps {
  t?: "xs" | "s" | "m" | "l"
  w?: "bold" | "normal"
}
export interface TProps extends TOwnProps, BoxProps {}

export const T: Component<TProps> = p => {
  const [local, rest] = splitProps(p, ["t", "w", "classList"])

  return (
    <Box
      {...rest}
      classList={{
        ...(local.t ? { [s.sizes[local.t]]: true } : {}),
        ...(local.w ? { [s.weights[local.w]]: true } : {}),
        ...classList,
      }}
    />
  )
}
