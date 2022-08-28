import { Link } from "solid-app-router"
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
            {props => (
              <Link href={`/picture/${picture.id}`} {...props}>
                <Picture picture={picture} sizes="28vw" />
                <PictureMetadata picture={picture} />
              </Link>
            )}
          </Stack>
        )}
      </For>
    </Stack>
  )
}
