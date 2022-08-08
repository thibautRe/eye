import { createResource, For } from "solid-js"
import { apiGetPictures } from "../../../api"
import { PictureElement } from "../../Picture"
import { Stack } from "../../Stack/Stack"

export default () => {
  const [picturesRes] = createResource(apiGetPictures)
  return (
    <Stack d="v">
      <For each={picturesRes()}>
        {picture => (
          <Stack d="v" fgColor="g10">
            <PictureElement picture={picture} />
            <span>{picture.name}</span>
          </Stack>
        )}
      </For>
    </Stack>
  )
}
