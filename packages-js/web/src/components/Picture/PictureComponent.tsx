import { createSignal, JSX, Show, splitProps, VoidComponent } from "solid-js"
import type { PictureApi, PictureSizeApi } from "../../types/picture"
import { AspectRatio } from "./AspectRatio"
import { PictureBlurhash } from "./PictureBlurhash"
import {
  pictureComponent,
  pictureComponentBlurhash,
} from "./PictureComponent.css"

const makeSizeSrc = (size: PictureSizeApi) => `${size.url} ${size.width}w`
const makeSrcset = (p: PictureApi) => p.sizes.map(makeSizeSrc).join(",")

const getFallbackSrc = (p: PictureApi) =>
  p.sizes.slice().sort((s1, s2) => s2.width - s1.width)[0]?.url

interface ImgComponentProps
  extends Omit<
    JSX.ImgHTMLAttributes<HTMLImageElement>,
    "alt" | "src" | "srcset"
  > {
  picture: PictureApi
}
const ImgComponent: VoidComponent<ImgComponentProps> = props => {
  const [local, rest] = splitProps(props, ["picture"])
  return (
    <img
      alt={local.picture.alt}
      src={getFallbackSrc(local.picture)}
      srcset={makeSrcset(local.picture)}
      {...rest}
    />
  )
}

export interface PictureProps
  extends Omit<ImgComponentProps, "onload" | "style" | "class" | "classList"> {}
export const Picture: VoidComponent<PictureProps> = props => {
  const [local, rest] = splitProps(props, ["picture"])
  const [isLoaded, setIsLoaded] = createSignal(false)
  const blurhash = () => local.picture.blurhash
  return (
    <AspectRatio aspectRatio={local.picture.width / local.picture.height}>
      <Show when={!isLoaded()}>
        <PictureBlurhash
          blurhash={blurhash()}
          class={pictureComponentBlurhash}
        />
      </Show>
      <ImgComponent
        picture={local.picture}
        onload={() => setIsLoaded(true)}
        style={{ opacity: isLoaded() ? 1 : 0.01 }}
        class={pictureComponent}
        {...rest}
      />
    </AspectRatio>
  )
}