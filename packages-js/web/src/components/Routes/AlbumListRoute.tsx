import { Link } from "solid-app-router"
import { For, Show } from "solid-js"
import { apiGetAlbums } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { PictureGrid } from "../Picture/PictureGrid"
import { Stack } from "../Stack/Stack"

export default () => {
  const albumsPaginated = createPaginatedLoader(apiGetAlbums)
  return (
    <Stack d="v" dist="m">
      <For each={albumsPaginated.data().items}>
        {album => (
          <Stack d="v" fgColor="g11">
            <Stack dist="xs" a="center">
              <Link href={`/album/${album.id}`}>
                <h1>{album.name}</h1>
              </Link>
              <span>({album.picturesAmt} pictures)</span>
            </Stack>
            <PictureGrid pictures={album.picturesExcerpt} />
          </Stack>
        )}
      </For>
    </Stack>
  )
}
