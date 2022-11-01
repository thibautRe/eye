import { Link } from "solid-app-router"
import { For, JSX, mergeProps, Show, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { Grid } from "../Grid/Grid"
import { Stack } from "../Stack/Stack"
import { AspectRatio } from "./AspectRatio"
import { Picture } from "./PictureComponent"

export interface PictureGridProps {
  pictures: readonly PictureApi[]
  extra?: JSX.Element
  sizes?: string
  readonly onDeletePicture?: (pictureId: PictureApi["id"]) => Promise<void>
}
export const PictureGrid: VoidComponent<PictureGridProps> = p => {
  p = mergeProps({ sizes: "28vw" }, p)
  return (
    <Grid ph="s" pv="l" gap="xl">
      <For each={p.pictures}>
        {picture => (
          <Stack d="v" fgColor="g11" style={{ height: "100%" }}>
            <Stack>
              {props => (
                <AspectRatio aspectRatio={3 / 2} {...props}>
                  <Link href={`/picture/${picture.id}`}>
                    <Picture picture={picture} sizes={p.sizes} />
                  </Link>
                </AspectRatio>
              )}
            </Stack>
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
    </Grid>
  )
}
