import { createResource, For } from "solid-js"
import { apiGetPictures } from "../../../api"
import { PictureComponent } from "../../Picture"
import { Stack } from "../../Stack/Stack"

export default () => {
  const [picturesRes] = createResource(apiGetPictures)
  return (
    <Stack d="v">
      <For each={picturesRes()}>
        {picture => (
          <Stack d="v" fgColor="g10">
            <PictureComponent
              picture={picture}
              sizes="50vw"
              style={{ width: "50vw" }}
            />
            <span>{picture.name}</span>
          </Stack>
        )}
      </For>
    </Stack>
  )
}
