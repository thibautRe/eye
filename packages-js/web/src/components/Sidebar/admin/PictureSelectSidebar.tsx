import { VoidComponent, For } from "solid-js"
import { apiGetPictures, GetPicturesProps } from "../../../api"
import { PictureApi } from "../../../types/picture"
import { createPaginatedLoader } from "../../../utils/hooks/createPaginatedLoader"
import { createSetSignal } from "../../../utils/hooks/createSetSignal"
import { Box } from "../../Box/Box"
import { Button } from "../../Button"
import { Grid } from "../../Grid/Grid"
import { Picture } from "../../Picture"
import { AspectRatio } from "../../Picture/AspectRatio"
import { PicturePlaceholders } from "../../Picture/PicturePlaceholder"
import { Stack } from "../../Stack/Stack"
import { vars } from "../../Styles/theme.css"

export interface PictureSelectSidebarProps {
  loaderProps: GetPicturesProps
  onSelectPictures: (pictureIds: PictureApi["id"][]) => void
}
export const PictureSelectSidebar: VoidComponent<
  PictureSelectSidebarProps
> = p => {
  const loader = createPaginatedLoader({
    loader: props => apiGetPictures(props, p.loaderProps),
  })
  const [pictureIds, { toggle }] = createSetSignal<PictureApi["id"]>()
  return (
    <Stack d="v" dist="m" style={{ "max-height": "100%" }}>
      <Box p="m">{p => <h2 {...p}>Select pictures</h2>}</Box>
      <Grid
        p="m"
        rowGap="xs"
        columnGap="xs"
        style={{ flex: 1, "overflow-y": "auto", "overflow-x": "hidden" }}
      >
        <For each={loader.data().items}>
          {picture => (
            <AspectRatio aspectRatio={3 / 2}>
              <Stack
                br="m"
                p="0"
                style={{
                  position: "relative",
                  height: "100%",
                  width: "100%",
                  "background-color": "transparent",
                  "border-width": "2px",
                  "border-style": "solid",
                  "border-color": pictureIds().has(picture.id)
                    ? vars.color.p9
                    : "transparent",
                }}
              >
                {props => (
                  <button onClick={() => toggle(picture.id)} {...props}>
                    <Picture picture={picture} sizes="100px" />
                  </button>
                )}
              </Stack>
            </AspectRatio>
          )}
        </For>
        {loader.data().nextPage !== null && (
          <PicturePlaceholders
            onFirstBecomeVisible={loader.onLoadNextContinuous}
            onFirstBecomeInvisible={loader.onLoadNextContinuousAbort}
          />
        )}
      </Grid>
      <Box p="m">
        <Button
          disabled={pictureIds().size === 0}
          onClick={() => p.onSelectPictures([...pictureIds()])}
        >
          Select {pictureIds().size} picture(s)
        </Button>
      </Box>
    </Stack>
  )
}
