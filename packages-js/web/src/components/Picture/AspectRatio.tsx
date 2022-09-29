import { assignInlineVars } from "@vanilla-extract/dynamic"
import { ParentComponent } from "solid-js"
import {
  aspectRatioC,
  aspectRatioInnerC,
  aspectRatioVar,
} from "./AspectRatio.css"

export interface AspectRatioProps {
  /** width / height */
  aspectRatio: number
}
export const AspectRatio: ParentComponent<AspectRatioProps> = props => (
  <div
    class={aspectRatioC}
    style={assignInlineVars({
      [aspectRatioVar]: `${100 / props.aspectRatio}%`,
    })}
    {...props}
  >
    <div class={aspectRatioInnerC}>{props.children}</div>
  </div>
)
