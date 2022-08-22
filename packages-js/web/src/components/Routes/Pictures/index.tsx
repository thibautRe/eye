import { createResource, For } from "solid-js"
import { apiGetPictures } from "../../../api"
import { Picture, PictureMetadata } from "../../Picture"
import { Stack } from "../../Stack/Stack"

export default () => {
  const [picturesRes] = createResource(apiGetPictures)
  return (
    <Stack wrap>
      <For each={picturesRes()}>
        {picture => (
          <Stack d="v" fgColor="g10" style={{ width: "30%" }}>
            <Picture picture={picture} sizes="28vw" />
            <PictureMetadata picture={picture} />
          </Stack>
        )}
      </For>
    </Stack>
  )
}
