import { For, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"

export interface PictureElementProps {
  picture: PictureApi
}
export const PictureElement: VoidComponent<PictureElementProps> = ({
  picture,
}) => {
  return (
    <picture>
      <For each={picture.sizes}>{size => <source src={size.url} />}</For>
      <img alt={picture.alt} />
    </picture>
  )
}
