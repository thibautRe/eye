import { Component, JSX } from "solid-js"
import { input } from "./TextInput.css"

export const TextInput: Component<
  JSX.InputHTMLAttributes<HTMLInputElement>
> = p => {
  return <input classList={{ [input]: true }} {...p} />
}
