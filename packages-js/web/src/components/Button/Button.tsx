import { JSX, ParentComponent, splitProps } from "solid-js"
import { Box } from "../Box/Box"
import { Tsizes, Tweights } from "../T/T"
import * as s from "./Button.css"

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {}
export const Button: ParentComponent<ButtonProps> = p => {
  const [local, rest] = splitProps(p, ["classList"])
  const classList = () => ({
    ...(local.classList ?? {}),
    [s.button]: true,
    [Tsizes.xs]: true,
    [Tweights.bold]: true,
  })
  return <button classList={classList()} {...rest} />
}
