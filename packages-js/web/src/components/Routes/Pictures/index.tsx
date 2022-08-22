import { createResource, For } from "solid-js"
import { apiGetPictures } from "../../../api"
import { Picture, PictureMetadata } from "../../Picture"
import { Stack } from "../../Stack/Stack"

export default () => {
  const [picturesRes] = createResource(apiGetPictures)
  return (
    <Stack d="v">
      <For each={picturesRes()}>
        {picture => (
          <Stack d="v" fgColor="g10" style={{ width: "50vw" }}>
            <Picture picture={picture} sizes="50vw" />
            <Stack dist="s">
              <span>{picture.name}</span>
              <PictureMetadata picture={picture} />
            </Stack>
          </Stack>
        )}
      </For>
    </Stack>
  )
}
