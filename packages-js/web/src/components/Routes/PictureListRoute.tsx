import { Link } from "solid-app-router"
import { createResource, For, Show } from "solid-js"
import { apiGetPictures } from "../../api"
import { PictureGrid } from "../Picture/PictureGrid"

export default () => {
  const [picturesRes] = createResource(apiGetPictures)
  return (
    <Show when={picturesRes()}>
      {pictures => <PictureGrid pictures={pictures} />}
    </Show>
  )
}
