import { Link } from "solid-app-router"
import { For, JSX, mergeProps, Show, splitProps, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { Button } from "../Button"
import { Grid, GridProps } from "../Grid/Grid"
import { Stack } from "../Stack/Stack"
import { AspectRatio } from "./AspectRatio"
import { Picture } from "./PictureComponent"

export interface PictureGridProps extends GridProps {
  pictures: readonly PictureApi[]
  extra?: JSX.Element
  sizes?: string
  onDeletePicture?: (pictureId: PictureApi["id"]) => Promise<void>
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
          <Stack d="v" fgColor="g11" style={{ height: "100%" }} a="start">
            <AspectRatio aspectRatio={3 / 2}>
              <Link href={`/picture/${picture.id}`}>
                <Picture picture={picture} sizes={local.sizes} />
              </Link>
            </AspectRatio>
            <Show when={local.onDeletePicture}>
              {onDeletePicture => (
                <Button onClick={() => onDeletePicture(picture.id)}>
                  Delete
                </Button>
              )}
            </Show>
          </Stack>
        )}
      </For>
      {local.extra}
    </Grid>
  )
}
