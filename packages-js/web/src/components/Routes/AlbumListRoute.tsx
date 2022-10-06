import { Link } from "solid-app-router"
import { createResource, For, Show } from "solid-js"
import { apiGetAlbums } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { PictureGrid } from "../Picture/PictureGrid"
import { Stack } from "../Stack/Stack"

export default () => {
  const albumsPaginated = createPaginatedLoader(apiGetAlbums)
  return (
    <Show when={albumsPaginated.data()}>
      {albums => (
        <Stack d="v" dist="m">
          <For each={albums.items}>
            {album => (
              <Stack d="v" fgColor="g10">
                <Link href={`/album/${album.id}`}>
                  <h1>{album.name}</h1>
                </Link>
                <PictureGrid pictures={album.picturesExcerpt} />
              </Stack>
            )}
          </For>
        </Stack>
      )}
    </Show>
  )
}
