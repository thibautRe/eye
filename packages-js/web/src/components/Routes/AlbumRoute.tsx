import { Link, useParams } from "solid-app-router"
import { createResource, For, Show } from "solid-js"
import { apiGetAlbum } from "../../api"
import { Picture, PictureMetadata } from "../Picture"
import { PictureGrid } from "../Picture/PictureGrid"
import { Stack } from "../Stack/Stack"

export default () => {
  const params = useParams<{ id: string }>()
  const [albumRes] = createResource(() => parseInt(params.id, 10), apiGetAlbum)
  return (
    <Show when={albumRes()}>
      {album => (
        <Stack d="v" fgColor="g10">
          <h1>{album.name}</h1>
          <PictureGrid pictures={album.picturesExcerpt} />
        </Stack>
      )}
    </Show>
  )
}
