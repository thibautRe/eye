import { Link } from "solid-app-router"
import { Component, For, JSX, mergeProps, Show, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { Stack } from "../Stack/Stack"
import { Picture } from "./PictureComponent"
import { PictureMetadata } from "./PictureMetadata"

export interface PictureGridProps {
  pictures: PictureApi[]
  extra?: JSX.Element
  sizes?: string
  readonly onDeletePicture?: (pictureId: PictureApi["id"]) => Promise<void>
}
export const PictureGrid: VoidComponent<PictureGridProps> = p => {
  p = mergeProps({ sizes: "28vw" }, p)
  return (
    <Stack wrap>
      <For each={p.pictures}>
        {picture => (
          <Stack d="v" fgColor="g10" style={{ width: "30%" }}>
            <Link href={`/picture/${picture.id}`}>
              <Picture picture={picture} sizes={p.sizes} />
            </Link>
            <PictureMetadata picture={picture} />
            <Show when={p.onDeletePicture}>
              {onDeletePicture => (
                <button onClick={() => onDeletePicture(picture.id)}>
                  Delete
                </button>
              )}
            </Show>
          </Stack>
        )}
      </For>
      {p.extra}
    </Stack>
  )
}
