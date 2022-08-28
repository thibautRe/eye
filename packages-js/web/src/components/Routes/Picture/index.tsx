import { useParams } from "solid-app-router"
import { createResource, For, Show } from "solid-js"
import { apiGetPicture, apiGetPictures } from "../../../api"
import { Picture, PictureMetadata } from "../../Picture"
import { Stack } from "../../Stack/Stack"

export default () => {
  const params = useParams<{ id: string }>()
  const [pictureRes] = createResource(
    () => parseInt(params.id, 10),
    apiGetPicture,
  )
  return (
    <Show when={pictureRes()}>
      {picture => (
        <Stack d="v" fgColor="g10" style={{ width: "90%" }}>
          <Picture picture={picture} sizes="90vw" />
          <PictureMetadata picture={picture} />
        </Stack>
      )}
    </Show>
  )
}
