import { children, Component, JSX, splitProps } from "solid-js"
import { Tsizes, Tweights } from "../T/T"
import * as s from "./Button.css"

export interface ButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?:
    | JSX.Element
    | ((p: Pick<JSX.HTMLAttributes<Element>, "classList">) => JSX.Element)
}
export const Button: Component<ButtonProps> = p => {
  const [local, rest] = splitProps(p, ["classList", "children"])
  const classList = () => ({
    ...(local.classList ?? {}),
    [s.button]: true,
    [Tsizes.xs]: true,
    [Tweights.bold]: true,
  })

  // @ts-expect-error Props of children function
  const res = children(() => local.children)
  if (typeof res() === "function") {
    // @ts-expect-error res() is not a function
    return <>{res()({ ...rest, classList: classList() })}</>
  }
  return (
    <button classList={classList()} {...rest}>
      {res()}
    </button>
  )
}
