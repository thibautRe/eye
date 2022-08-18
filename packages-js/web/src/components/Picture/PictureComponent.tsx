import { JSX, VoidComponent } from "solid-js"
import type { PictureApi, PictureSizeApi } from "../../types/picture"

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
}) => {
  return (
    <img
      alt={picture.alt}
      src={picture.sizes.slice().sort((s1, s2) => s2.width - s1.width)[0].url}
      srcset={makeSrcset(picture)}
      {...props}
    />
  )
}
