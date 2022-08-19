import { decode } from "blurhash"
import { createSignal, JSX, Show, VoidComponent } from "solid-js"
import type { PictureApi, PictureSizeApi } from "../../types/picture"
import { AspectRatio } from "./AspectRatio"

const makeSizeSrc = (size: PictureSizeApi) => `${size.url} ${size.width / 2}w`
const makeSrcset = (p: PictureApi) => p.sizes.map(makeSizeSrc).join(",")

export interface PictureComponentProps
  extends Omit<
    JSX.ImgHTMLAttributes<HTMLImageElement>,
    "alt" | "src" | "srcset"
  > {
  picture: PictureApi
}
export const PictureComponent: VoidComponent<PictureComponentProps> = ({
  picture,
  ...props
}) => (
  <img
    alt={picture.alt}
    src={picture.sizes.slice().sort((s1, s2) => s2.width - s1.width)[0]?.url}
    srcset={makeSrcset(picture)}
    {...props}
  />
)

export const Picture: VoidComponent<PictureComponentProps> = ({
  picture,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = createSignal(false)
  return (
    <AspectRatio aspectRatio={picture.width / picture.height}>
      <Show when={!isLoaded()}>
        <canvas
          width={32}
          height={32}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          class={props.class}
          classList={props.classList}
          ref={el => {
            const context = el.getContext("2d")
            const decoded = decode(picture.blurhash, 32, 32)
            const imageData = new ImageData(decoded, 32, 32)
            context?.putImageData(imageData, 0, 0)
          }}
        />
      </Show>
      <PictureComponent
        picture={picture}
        onload={() => setIsLoaded(true)}
        style={{ width: "100%", height: "100%" }}
        {...props}
      />
    </AspectRatio>
  )
}
