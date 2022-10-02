import { createResource, For, Show } from "solid-js"
import { apiGetAlbums } from "../../api"
import { PictureGrid } from "../Picture/PictureGrid"
import { Stack } from "../Stack/Stack"

export default () => {
  const [albumsRes] = createResource(apiGetAlbums)
  return (
    <Show when={albumsRes()}>
      {albums => (
        <Stack d="v" dist="m">
          <For each={albums}>
            {album => (
              <Stack d="v" fgColor="g10">
                <h1>{album.name}</h1>
                <PictureGrid pictures={album.picturesExcerpt} />
              </Stack>
            )}
          </For>
        </Stack>
      )}
    </Show>
  )
}
