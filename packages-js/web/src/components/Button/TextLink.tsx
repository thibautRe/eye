import { ParentComponent } from "solid-js"
import { T } from "../T/T"

import * as s from "./TextLink.css"
import { A, AnchorProps } from "@solidjs/router"

export interface TextLinkProps
  extends Omit<AnchorProps, "class" | "style" | "classList"> {}
export const TextLink: ParentComponent<TextLinkProps> = p => (
  <T t="s" fgColor="p10" class={s.textLink}>
    {props => (
      <A {...props} {...p}>
        {p.children}
      </A>
    )}
  </T>
)
