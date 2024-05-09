import { assignInlineVars } from "@vanilla-extract/dynamic"
import { ParentComponent } from "solid-js"
import {
  aspectRatioC,
  aspectRatioInnerC,
  aspectRatioVar,
} from "./AspectRatio.css"
import { PictureApi } from "../../types/picture"

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

export interface AspectRatioPictureProps {
  picture: Pick<PictureApi, "height" | "width">
}
export const AspectRatioPicture: ParentComponent<
  AspectRatioPictureProps
> = p => (
  <AspectRatio aspectRatio={p.picture.width / p.picture.height}>
    {p.children}
  </AspectRatio>
)
