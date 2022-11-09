import { JSX, ParentComponent } from "solid-js"
import { T } from "../T/T"

import * as s from "./TextLink.css"

export interface TextLinkProps
  extends Omit<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    "class" | "style" | "classList"
  > {}
export const TextLink: ParentComponent<TextLinkProps> = p => (
  <T t="s" fgColor="p10" class={s.textLink}>
    {props => (
      <a {...props} {...p}>
        {p.children}
      </a>
    )}
  </T>
)
