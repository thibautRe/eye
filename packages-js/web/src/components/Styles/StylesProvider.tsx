import { Component, ParentComponent } from "solid-js"
import { themeClass } from "./theme.css"

export const StylesProvider: ParentComponent = p => {
  return <div class={themeClass}>{p.children}</div>
}
