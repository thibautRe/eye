import { useNavigate, useParams } from "@solidjs/router"
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
import { adminOptionalValue } from "../AuthFence"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import { PictureSelectSidebar } from "../Sidebar/admin/PictureSelectSidebar"
import { SidebarButton } from "../Sidebar/SidebarButton"
import { UserSelectSidebar } from "../Sidebar/admin/UserSelectSidebar"
import { Button } from "../Button"
import { PictureApi } from "../../types/picture"
import { PageLayout } from "../Layout/PageLayout"
import { AdminToolbarSeparator } from "../Admin/AdminToolbar/AdminToolbarSeparator"
import { createBooleanSignal } from "../../utils/hooks/createBooleanSignal"

const [showEditAlbum, showEditAlbumActions] = createBooleanSignal()

export default () => {
  const params = useParams<{ id: string }>()
  const getAlbumId = () => parseInt(params.id, 10)
  const [albumRes] = createResource(getAlbumId, apiGetAlbum)
  const picturesLoader = createPaginatedLoader({
    loader: props => apiGetPictures(props, { albumId: getAlbumId() }),
    cacheKey: () => `album-${getAlbumId()}`,
  })

  return (
    <PageLayout
      adminToolbarItems={
        <Show when={albumRes()}>
          {a => <AlbumAdminActions albumId={a().id} loader={picturesLoader} />}
        </Show>
      }
    >
      <Show when={albumRes()}>
        {album => (
          <Stack d="v" dist="m" fgColor="g10" ph="xl" phM="s">
            <Stack dist="m" a="center">
              <T t="l" fgColor="g11">
                {p => <h1 {...p}>{album.name}</h1>}
              </T>
            </Stack>
            <PictureGridPaginated
              loader={picturesLoader}
              onDeletePicture={
                showEditAlbum()
                  ? adminOptionalValue(async id => {
                      await apiDeleteAlbumPictures(album().id, [id])
                      picturesLoader.onReload()
                    })
                  : undefined
              }
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
    <>
      <Stack d="v" dist="xs">
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
        <Button onClick={showEditAlbumActions.toggle}>
          {!showEditAlbum() ? "Edit album content" : "Stop editing content"}
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
      <AdminToolbarSeparator />
      <Stack d="v" dist="xs">
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
      </Stack>
    </>
  )
}
