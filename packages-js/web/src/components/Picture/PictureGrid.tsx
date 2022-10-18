import { Link } from "solid-app-router"
import { Component, For, JSX, mergeProps, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { Stack } from "../Stack/Stack"
import { Picture } from "./PictureComponent"
import { PictureMetadata } from "./PictureMetadata"

export interface PictureGridProps {
  pictures: PictureApi[]
  extra?: JSX.Element
  sizes?: string
}
export const PictureGrid: VoidComponent<PictureGridProps> = p => {
  p = mergeProps({ sizes: "28vw" }, p)
  return (
    <Stack wrap>
      <For each={p.pictures}>
        {picture => (
          <Stack d="v" fgColor="g10" style={{ width: "30%" }}>
            {props => (
              <Link href={`/picture/${picture.id}`} {...props}>
                <Picture picture={picture} sizes={p.sizes} />
                <PictureMetadata picture={picture} />
              </Link>
            )}
          </Stack>
        )}
      </For>
      {p.extra}
    </Stack>
  )
}
