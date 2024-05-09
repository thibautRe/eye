import {
  createEffect,
  createSignal,
  JSX,
  Show,
  splitProps,
  VoidComponent,
} from "solid-js"
import type { PictureApi, PictureSizeApi } from "../../types/picture"
import { createBecomesVisible } from "../../utils/hooks/createBecomesVisible"
import { createBooleanSignal } from "../../utils/hooks/createBooleanSignal"
import { PictureBlurhash } from "./PictureBlurhash"
import * as s from "./PictureComponent.css"

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

// Cache pictures that have loaded
const loadedPictures = new Set<string>()

export interface PictureProps
  extends Omit<ImgComponentProps, "onload" | "style" | "class" | "classList"> {}
export const Picture: VoidComponent<PictureProps> = props => {
  const [local, rest] = splitProps(props, ["picture"])
  const [shouldLoad, { enable }] = createBooleanSignal(false)
  const [isLoaded, setIsLoaded] = createSignal(
    loadedPictures.has(`${local.picture.id}-${rest.sizes}`),
  )
  // Timeout to hide blurhash
  const [hideBlurhash, { enable: hideBlurHash }] = createBooleanSignal(
    isLoaded(),
  )
  createEffect(() => {
    if (!isLoaded()) return
    setTimeout(hideBlurHash, 300)
  })

  const blurhash = () => local.picture.blurhash
  return (
    <>
      <Show when={!hideBlurhash()}>
        <PictureBlurhash
          blurhash={blurhash()}
          class={s.blurhash}
          ref={createBecomesVisible({
            onBecomesVisible: enable,
            disconnectAfterVisible: true,
          })}
        />
      </Show>
      <Show when={shouldLoad() || isLoaded()}>
        <ImgComponent
          picture={local.picture}
          onload={() => {
            setIsLoaded(true)
            loadedPictures.add(`${local.picture.id}-${rest.sizes}`)
          }}
          style={{ opacity: isLoaded() ? 1 : 0.4 }}
          classList={{ [s.picture]: true, [s.pictureLoading]: !isLoaded() }}
          {...rest}
        />
      </Show>
    </>
  )
}
