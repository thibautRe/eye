import { useParams } from "solid-app-router"
import { createResource, Show } from "solid-js"
import { apiGetAlbum, apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { Stack } from "../Stack/Stack"

export default () => {
  const params = useParams<{ id: string }>()
  const getAlbumId = () => parseInt(params.id, 10)
  const [albumRes] = createResource(getAlbumId, apiGetAlbum)
  const picturesLoader = createPaginatedLoader(props =>
    apiGetPictures(props, { albumId: getAlbumId() }),
  )
  return (
    <Show when={albumRes()}>
      {album => (
        <Stack d="v" fgColor="g10">
          <h1>{album.name}</h1>
          <PictureGridPaginated loader={picturesLoader} />
        </Stack>
      )}
    </Show>
  )
}
