import { useLocation, useNavigate, useParams } from "solid-app-router"
import {
  createEffect,
  createResource,
  createSignal,
  For,
  Show,
  VoidComponent,
} from "solid-js"
import {
  apiAddAlbumPictures,
  apiDeleteAlbum,
  apiDeleteAlbumPictures,
  apiGetAlbum,
  apiGetPictures,
} from "../../api"
import { AlbumApi } from "../../types/album"
import { PictureApi } from "../../types/picture"
import { createEscKeySignal } from "../../utils/hooks/createEscKeyHandler"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { createSetSignal } from "../../utils/hooks/createSetSignal"
import { AdminFenceOptional, adminOptionalValue } from "../AuthFence"
import { Box } from "../Box/Box"
import { Grid } from "../Grid/Grid"
import { Picture } from "../Picture"
import { AspectRatio } from "../Picture/AspectRatio"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { PicturePlaceholder } from "../Picture/PicturePlaceholder"
import { Stack } from "../Stack/Stack"
import { vars } from "../Styles/theme.css"
import { T } from "../T/T"
import { Sidebar } from "./Sidebar/Sidebar"

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
        <Stack d="v" dist="s" fgColor="g10">
          <Stack dist="m" a="center">
            <T t="l" fgColor="g11">
              {p => <h1 {...p}>{album.name}</h1>}
            </T>
            <AdminFenceOptional>
              <AlbumAddPictures
                albumId={album.id}
                onAddedPictures={() => picturesLoader.onReload()}
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
    <button
      onClick={async () => {
        if (!confirm("Do you really want to delete this album?")) return
        await apiDeleteAlbum(p.albumId)
        navigate("/albums", { replace: true })
      }}
    >
      Delete album
    </button>
  )
}

const AlbumAddPictures: VoidComponent<AlbumAddPicturesSidebarProps> = p => {
  const [isOpen, { enable: open, disable: close }] = createEscKeySignal()
  const onAddedPictures = () => {
    close()
    p.onAddedPictures()
  }
  return (
    <>
      <button onClick={open}>Add pictures</button>
      <Sidebar isOpen={isOpen()} onClose={close}>
        <AlbumAddPicturesSidebar {...p} onAddedPictures={onAddedPictures} />
      </Sidebar>
    </>
  )
}

interface AlbumAddPicturesSidebarProps {
  albumId: AlbumApi["id"]
  onAddedPictures: () => void
}
const AlbumAddPicturesSidebar: VoidComponent<
  AlbumAddPicturesSidebarProps
> = p => {
  const loader = createPaginatedLoader(props =>
    apiGetPictures(props, { notAlbumId: p.albumId }),
  )
  const [pictureIds, { toggle }] = createSetSignal<PictureApi["id"]>()
  return (
    <Stack d="v" dist="m" style={{ "max-height": "100%" }}>
      <Box p="m">{p => <h2 {...p}>Add pictures</h2>}</Box>
      <Grid p="m" gap="xs" style={{ flex: 1, "overflow-y": "auto" }}>
        <For each={loader.data().items}>
          {picture => (
            <AspectRatio aspectRatio={3 / 2}>
              <Stack br="m" p="0">
                {props => (
                  <button
                    onClick={() => toggle(picture.id)}
                    style={{
                      height: "100%",
                      width: "100%",
                      "background-color": "transparent",
                      "border-width": "2px",
                      "border-style": "solid",
                      "border-color": pictureIds().has(picture.id)
                        ? vars.color.amber6
                        : "transparent",
                    }}
                    {...props}
                  >
                    <Picture picture={picture} sizes="100px" />
                  </button>
                )}
              </Stack>
            </AspectRatio>
          )}
        </For>
        {loader.data().nextPage !== null && (
          <PicturePlaceholder onBecomeVisible={loader.onLoadNext} />
        )}
      </Grid>
      <Stack p="m">
        <button
          disabled={pictureIds().size === 0}
          onClick={async () => {
            await apiAddAlbumPictures(p.albumId, [...pictureIds()])
            p.onAddedPictures()
          }}
        >
          Add {pictureIds().size} pictures
        </button>
      </Stack>
    </Stack>
  )
}
