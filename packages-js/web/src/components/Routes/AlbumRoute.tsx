import { useNavigate, useParams } from "solid-app-router"
import { createResource, Show, VoidComponent } from "solid-js"
import {
  apiAddAlbumPictures,
  apiAdminUserAddAlbumAccess,
  apiAdminUsersAddPictureAccess,
  apiDeleteAlbum,
  apiDeleteAlbumPictures,
  apiGetAlbum,
  apiGetPictures,
} from "../../api"
import { AlbumApi } from "../../types/album"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { AdminFenceOptional, adminOptionalValue } from "../AuthFence"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import { PictureSelectSidebar } from "../Sidebar/admin/PictureSelectSidebar"
import { SidebarButton } from "../Sidebar/SidebarButton"
import { UserSelectSidebar } from "../Sidebar/admin/UserSelectSidebar"
import { Button } from "../Button"

export default () => {
  const params = useParams<{ id: string }>()
  const getAlbumId = () => parseInt(params.id, 10)
  const [albumRes] = createResource(getAlbumId, apiGetAlbum)
  const picturesLoader = createPaginatedLoader({
    loader: props => apiGetPictures(props, { albumId: getAlbumId() }),
    cacheKey: () => `album-${getAlbumId()}`,
  })

  return (
    <Show when={albumRes()}>
      {album => (
        <Stack d="v" dist="m" fgColor="g10" ph="s">
          <Stack dist="m" a="center">
            <T t="l" fgColor="g11">
              {p => <h1 {...p}>{album.name}</h1>}
            </T>
            <AdminFenceOptional>
              <SidebarButton
                renderButton={p => <Button {...p}>Add pictures</Button>}
                renderChildren={({ onClose }) => (
                  <PictureSelectSidebar
                    loaderProps={{ notAlbumId: album.id }}
                    onSelectPictures={async pictureIds => {
                      await apiAddAlbumPictures(album.id, pictureIds)
                      picturesLoader.onReload()
                      onClose()
                    }}
                  />
                )}
              />
              <SidebarButton
                renderButton={p => <Button {...p}>Grant user access</Button>}
                renderChildren={({ onClose }) => (
                  <UserSelectSidebar
                    onSelectUsers={async userIds => {
                      await apiAdminUserAddAlbumAccess(userIds, album.id)
                      onClose()
                    }}
                  />
                )}
              />
              <AlbumDelete albumId={album.id} />
            </AdminFenceOptional>
          </Stack>
          <PictureGridPaginated
            loader={picturesLoader}
            onDeletePicture={adminOptionalValue(async id => {
              await apiDeleteAlbumPictures(album.id, [id])
              picturesLoader.onReload()
            })}
          />
        </Stack>
      )}
    </Show>
  )
}

const AlbumDelete: VoidComponent<{ albumId: AlbumApi["id"] }> = p => {
  const navigate = useNavigate()
  return (
    <Button
      onClick={async () => {
        if (!confirm("Do you really want to delete this album?")) return
        await apiDeleteAlbum(p.albumId)
        navigate("/albums", { replace: true })
      }}
    >
      Delete album
    </Button>
  )
}
