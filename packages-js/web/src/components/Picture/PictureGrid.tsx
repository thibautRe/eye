import { Link } from "solid-app-router"
import { For, JSX, mergeProps, Show, splitProps, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { Grid, GridProps } from "../Grid/Grid"
import { Stack } from "../Stack/Stack"
import { AspectRatio } from "./AspectRatio"
import { Picture } from "./PictureComponent"

export interface PictureGridProps extends GridProps {
  pictures: readonly PictureApi[]
  extra?: JSX.Element
  sizes?: string
  readonly onDeletePicture?: (pictureId: PictureApi["id"]) => Promise<void>
}
export const PictureGrid: VoidComponent<PictureGridProps> = p => {
  p = mergeProps({ sizes: "28vw", gap: "xl" as const }, p)
  const [local, rest] = splitProps(p, [
    "pictures",
    "extra",
    "sizes",
    "onDeletePicture",
  ])
  return (
    <Grid {...rest}>
      <For each={local.pictures}>
        {picture => (
          <Stack d="v" fgColor="g11" style={{ height: "100%" }}>
            <Stack>
              {props => (
                <AspectRatio aspectRatio={3 / 2} {...props}>
                  <Link href={`/picture/${picture.id}`}>
                    <Picture picture={picture} sizes={local.sizes} />
                  </Link>
                </AspectRatio>
              )}
            </Stack>
            <Show when={local.onDeletePicture}>
              {onDeletePicture => (
                <button onClick={() => onDeletePicture(picture.id)}>
                  Delete
                </button>
              )}
            </Show>
          </Stack>
        )}
      </For>
      {local.extra}
    </Grid>
  )
}
