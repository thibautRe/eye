import { useParams } from "solid-app-router"
import {
  createResource,
  createSignal,
  For,
  Show,
  VoidComponent,
} from "solid-js"
import {
  apiAddAlbumPictures,
  apiDeleteAlbumPictures,
  apiGetAlbum,
  apiGetPictures,
} from "../../api"
import { AlbumApi } from "../../types/album"
import { PictureApi } from "../../types/picture"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { createSetSignal } from "../../utils/hooks/createSetSignal"
import { AdminFenceOptional, adminOptionalValue } from "../AuthFence"
import { Box } from "../Box/Box"
import { Picture } from "../Picture"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { PicturePlaceholder } from "../Picture/PicturePlaceholder"
import { Stack } from "../Stack/Stack"
import { vars } from "../Styles/theme.css"
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
            <h1>{album.name}</h1>
            <AdminFenceOptional>
              <AlbumAddPictures
                albumId={album.id}
                onAddedPictures={() => picturesLoader.onReload()}
              />
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

const AlbumAddPictures: VoidComponent<AlbumAddPicturesSidebarProps> = p => {
  const [addPicOpen, setAddPicOpen] = createSignal(false)
  return (
    <>
      <button onClick={() => setAddPicOpen(true)}>Add pictures</button>
      <Sidebar isOpen={addPicOpen()} onClose={() => setAddPicOpen(false)}>
        <AlbumAddPicturesSidebar
          {...p}
          onAddedPictures={() => {
            setAddPicOpen(false)
            p.onAddedPictures()
          }}
        />
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
      <Stack wrap p="m" style={{ flex: 1, "overflow-y": "auto" }}>
        <For each={loader.data().items}>
          {picture => (
            <Stack
              d="v"
              fgColor="g10"
              p="s"
              br="m"
              style={{
                width: "30%",
                "margin-top": vars.space.xs,
                "margin-left": vars.space.xs,
              }}
            >
              {props => (
                <button
                  onClick={() => toggle(picture.id)}
                  style={{
                    border: "none",
                    "background-color": pictureIds().has(picture.id)
                      ? vars.color.amber6
                      : "transparent",
                  }}
                  {...props}
                >
                  <Picture picture={picture} sizes="100px" />
                </button>
              )}
            </Stack>
          )}
        </For>
        {loader.data().nextPage !== null && (
          <PicturePlaceholder onBecomeVisible={loader.onLoadNext} />
        )}
      </Stack>
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
