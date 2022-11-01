import { decode } from "blurhash"
import { JSX, mergeProps, onMount, splitProps, VoidComponent } from "solid-js"

export interface PictureBlurhashProps
  extends Omit<
    JSX.CanvasHTMLAttributes<HTMLCanvasElement>,
    "height" | "width"
  > {
  blurhash: string
  /** @default 32 */
  resolution?: number
}
export const PictureBlurhash: VoidComponent<PictureBlurhashProps> = props => {
  const p = mergeProps({ resolution: 32 }, props)
  const [local, rest] = splitProps(p, ["resolution", "blurhash"])
  let canvasElt: HTMLCanvasElement | undefined
  onMount(() => {
    canvasElt
      ?.getContext("2d")
      ?.putImageData(getData(local.blurhash, local.resolution), 0, 0)
  })
  return (
    <canvas
      ref={canvas => {
        canvasElt = canvas
        if (props.ref instanceof Function) {
          props.ref(canvas)
        }
      }}
      width={local.resolution}
      height={local.resolution}
      {...rest}
    />
  )
}

const getData = (h: string, r: number) => new ImageData(decode(h, r, r), r, r)
