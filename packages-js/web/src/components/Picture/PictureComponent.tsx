import { createSignal, JSX, Show, splitProps, VoidComponent } from "solid-js"
import type { PictureApi, PictureSizeApi } from "../../types/picture"
import { createBecomesVisible } from "../../utils/hooks/createBecomesVisible"
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
  const [shouldLoad, setShouldLoad] = createSignal(false)
  const [isLoaded, setIsLoaded] = createSignal(false)
  const blurhash = () => local.picture.blurhash
  let eltRef = createBecomesVisible(() => setShouldLoad(true))
  return (
    <AspectRatio
      aspectRatio={local.picture.width / local.picture.height}
      ref={eltRef}
    >
      <Show when={!isLoaded()}>
        <PictureBlurhash
          blurhash={blurhash()}
          class={pictureComponentBlurhash}
        />
      </Show>
      <Show when={shouldLoad()}>
        <ImgComponent
          picture={local.picture}
          onload={() => setIsLoaded(true)}
          style={{ opacity: isLoaded() ? 1 : 0.01 }}
          class={pictureComponent}
          {...rest}
        />
      </Show>
    </AspectRatio>
  )
}
