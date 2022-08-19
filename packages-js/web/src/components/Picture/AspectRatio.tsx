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
export const AspectRatio: ParentComponent<AspectRatioProps> = ({
  aspectRatio,
  children,
}) => (
  <div
    class={aspectRatioC}
    style={assignInlineVars({ [aspectRatioVar]: `${100 / aspectRatio}%` })}
  >
    <div class={aspectRatioInnerC}>{children}</div>
  </div>
)
