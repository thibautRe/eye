import { useParams } from "solid-app-router"
import { createResource, Show, VoidComponent } from "solid-js"
import { apiGetPicture } from "../../api"
import { useTrans } from "../../providers/I18n"
import { PictureApi } from "../../types/picture"
import { Box } from "../Box/Box"
import { Picture, PictureMetadata } from "../Picture"
import { AspectRatio } from "../Picture/AspectRatio"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"

export default () => {
  const params = useParams<{ id: string }>()
  const [pictureRes] = createResource(
    () => parseInt(params.id, 10),
    apiGetPicture,
  )
  return (
    <Stack d="v" dist="m">
      <Show when={pictureRes()}>
        {picture => (
          <Stack d="v" fgColor="g10" style={{ width: "90%" }} a="stretch">
            <Box
              style={{
                "max-width": `${(picture.width / picture.height) * 100}vh`,
              }}
            >
              <AspectRatio aspectRatio={picture.width / picture.height}>
                <Picture picture={picture} sizes="90vw" />
              </AspectRatio>
            </Box>
            <PictureMetadata picture={picture} />
            <PictureActions picture={picture} />
          </Stack>
        )}
      </Show>
    </Stack>
  )
}

const PictureActions: VoidComponent<{ picture: PictureApi }> = p => {
  const t = useTrans()
  const highestResSize = p.picture.sizes
    .slice()
    .sort((p1, p2) => p2.width - p1.width)[0]
  return (
    <Stack dist="m" a="center">
      <T t="s" fgColor="amber10">
        {props => (
          <a {...props} rel="external" href={highestResSize.url}>
            {t("fullResolution")}
          </a>
        )}
      </T>
      <T t="s" fgColor="amber10">
        {props => (
          <a {...props} rel="external" href={highestResSize.url} download>
            {t("download")}
          </a>
        )}
      </T>
    </Stack>
  )
}
