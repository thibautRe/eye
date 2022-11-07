import { useNavigate, useParams } from "solid-app-router"
import { createResource, Show, VoidComponent } from "solid-js"
import {
  apiAddAlbumPictures,
  apiAdminRemoveAlbumPublicAccess,
  apiAdminSetAlbumPublicAccess,
  apiAdminUserAddAlbumAccess,
  apiAdminUserRemoveAlbumAccess,
  apiDeleteAlbum,
  apiDeleteAlbumPictures,
  apiGetAlbum,
  apiGetPictures,
} from "../../api"
import { AlbumApi } from "../../types/album"
import {
  createPaginatedLoader,
  PaginatedLoader,
} from "../../utils/hooks/createPaginatedLoader"
import { AdminFenceOptional, adminOptionalValue } from "../AuthFence"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import { PictureSelectSidebar } from "../Sidebar/admin/PictureSelectSidebar"
import { SidebarButton } from "../Sidebar/SidebarButton"
import { UserSelectSidebar } from "../Sidebar/admin/UserSelectSidebar"
import { Button } from "../Button"
import { PictureApi } from "../../types/picture"
import { PageLayout } from "../Layout/PageLayout"

export default () => {
  const params = useParams<{ id: string }>()
  const getAlbumId = () => parseInt(params.id, 10)
  const [albumRes] = createResource(getAlbumId, apiGetAlbum)
  const picturesLoader = createPaginatedLoader({
    loader: props => apiGetPictures(props, { albumId: getAlbumId() }),
    cacheKey: () => `album-${getAlbumId()}`,
  })

  return (
    <PageLayout>
      <Show when={albumRes()}>
        {album => (
          <Stack d="v" dist="m" fgColor="g10" ph="s">
            <Stack dist="m" a="center">
              <T t="l" fgColor="g11">
                {p => <h1 {...p}>{album.name}</h1>}
              </T>
              <AdminFenceOptional>
                <AlbumAdminActions albumId={album.id} loader={picturesLoader} />
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
    </PageLayout>
  )
}

const AlbumAdminActions: VoidComponent<{
  albumId: AlbumApi["id"]
  loader: PaginatedLoader<PictureApi>
}> = p => {
  const navigate = useNavigate()
  return (
    <Stack dist="xs" a="center" wrap>
      <SidebarButton
        renderButton={p => <Button {...p}>Add pictures</Button>}
        renderChildren={({ onClose }) => (
          <PictureSelectSidebar
            loaderProps={{ notAlbumId: p.albumId }}
            onSelectPictures={async pictureIds => {
              await apiAddAlbumPictures(p.albumId, pictureIds)
              p.loader.onReload()
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
              await apiAdminUserAddAlbumAccess(userIds, p.albumId)
              onClose()
            }}
          />
        )}
      />
      <SidebarButton
        renderButton={p => <Button {...p}>Remove user access</Button>}
        renderChildren={({ onClose }) => (
          <UserSelectSidebar
            onSelectUsers={async userIds => {
              await apiAdminUserRemoveAlbumAccess(userIds, p.albumId)
              onClose()
            }}
          />
        )}
      />
      <Button
        onClick={async () => {
          if (!confirm("Do you really want to make all pictures public?"))
            return
          await apiAdminSetAlbumPublicAccess(p.albumId)
        }}
      >
        Make public
      </Button>
      <Button
        onClick={async () => {
          if (!confirm("Do you really want to make all pictures private?"))
            return
          await apiAdminRemoveAlbumPublicAccess(p.albumId)
        }}
      >
        Make private
      </Button>
      <Button
        onClick={async () => {
          if (!confirm("Do you really want to delete this album?")) return
          await apiDeleteAlbum(p.albumId)
          navigate("/albums", { replace: true })
        }}
      >
        Delete album
      </Button>
    </Stack>
  )
}
