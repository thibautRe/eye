import { Link } from "solid-app-router"
import { For, Show } from "solid-js"
import { apiCreateAlbum, apiGetAlbums } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { AdminFenceOptional } from "../AuthFence"
import { Box } from "../Box/Box"
import { PictureGrid } from "../Picture/PictureGrid"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"

export default () => {
  const albumsPaginated = createPaginatedLoader(apiGetAlbums)
  return (
    <Stack d="v" dist="m">
      <For each={albumsPaginated.data().items}>
        {album => (
          <Stack d="v" dist="m" fgColor="g11" ph="s">
            <Stack dist="xs" a="baseline">
              <T t="l" fgColor="g11">
                {props => (
                  <Link {...props} href={`/album/${album.id}`}>
                    {album.name}
                  </Link>
                )}
              </T>
              <T t="s" fgColor="g10">
                ({album.picturesAmt} pictures)
              </T>
            </Stack>
            <PictureGrid pictures={album.picturesExcerpt} />
          </Stack>
        )}
      </For>
      <AdminFenceOptional>
        <Box pv="l">
          <button
            onClick={async () => {
              const name = prompt("Album name")
              if (!name) return
              await apiCreateAlbum(name)
              albumsPaginated.onReload()
            }}
          >
            Create new album
          </button>
        </Box>
      </AdminFenceOptional>
    </Stack>
  )
}
