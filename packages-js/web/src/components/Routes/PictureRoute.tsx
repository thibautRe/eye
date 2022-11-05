import { useParams } from "solid-app-router"
import {
  createResource,
  ErrorBoundary,
  For,
  Show,
  Suspense,
  VoidComponent,
} from "solid-js"
import {
  apiAdminGetPicturePublicAccess,
  apiAdminGetUsersPictureAccess,
  apiAdminRemovePicturePublicAccess,
  apiAdminSetPicturePublicAccess,
  apiAdminUsersAddPictureAccess,
  apiAdminUsersRemovePictureAccess,
  apiGetPicture,
} from "../../api"
import { useTrans } from "../../providers/I18n"
import { PictureApi } from "../../types/picture"
import { AdminFenceOptional } from "../AuthFence"
import { Box } from "../Box/Box"
import { Button } from "../Button"
import { Picture, PictureMetadata } from "../Picture"
import { AspectRatio } from "../Picture/AspectRatio"
import { UserSelectSidebar } from "../Sidebar/admin/UserSelectSidebar"
import { SidebarButton } from "../Sidebar/SidebarButton"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"

export default () => {
  const params = useParams<{ id: string }>()
  const [pictureRes] = createResource(
    () => parseInt(params.id, 10),
    apiGetPicture,
  )
  return (
    <Stack d="v" dist="m">
      <Show when={pictureRes()}>
        {picture => (
          <Stack d="v" dist="xl" fgColor="g10">
            <Stack d="v" a="center">
              <Box
                style={{
                  width: `${(picture.width / picture.height) * 100}vh`,
                  "max-width": "100%",
                }}
              >
                <AspectRatio aspectRatio={picture.width / picture.height}>
                  <Picture picture={picture} sizes="90vw" />
                </AspectRatio>
              </Box>
              <PictureMetadata picture={picture} />
              <PictureActions picture={picture} />
            </Stack>

            <AdminFenceOptional>
              <Suspense>
                <ErrorBoundary fallback={<T t="xs">Could not load actions</T>}>
                  <PictureUserAccessActions pictureId={picture.id} />
                </ErrorBoundary>
              </Suspense>
            </AdminFenceOptional>
          </Stack>
        )}
      </Show>
    </Stack>
  )
}

const PictureActions: VoidComponent<{ picture: PictureApi }> = p => {
  const t = useTrans()
  const highestResSize = p.picture.sizes
    .slice()
    .sort((p1, p2) => p2.width - p1.width)[0]
  return (
    <Stack dist="m" a="center">
      <T t="s" fgColor="p10">
        {props => (
          <a {...props} rel="external" href={highestResSize.url}>
            {t("fullResolution")}
          </a>
        )}
      </T>
      <T t="s" fgColor="p10">
        {props => (
          <a {...props} rel="external" href={highestResSize.url} download>
            {t("download")}
          </a>
        )}
      </T>
    </Stack>
  )
}

const PictureUserAccessActions: VoidComponent<{
  pictureId: PictureApi["id"]
}> = p => {
  const [userAccessRes, userAccessResActions] = createResource(
    () => p.pictureId,
    apiAdminGetUsersPictureAccess,
  )
  const [publicAccessRes, publicAccessResActions] = createResource(
    () => p.pictureId,
    apiAdminGetPicturePublicAccess,
  )
  return (
    <Stack d="v" dist="s" a="start" p="xl">
      <SidebarButton
        renderButton={p => <Button {...p}>Grant user access</Button>}
        renderChildren={({ onClose }) => (
          <UserSelectSidebar
            onSelectUsers={async userIds => {
              await apiAdminUsersAddPictureAccess(userIds, p.pictureId)
              userAccessResActions.refetch()
              onClose()
            }}
          />
        )}
      />
      <Show
        when={publicAccessRes()}
        fallback={
          <Button
            onClick={async () => {
              await apiAdminSetPicturePublicAccess(p.pictureId)
              publicAccessResActions.refetch()
            }}
          >
            Enable public access
          </Button>
        }
      >
        <Button
          onClick={async () => {
            await apiAdminRemovePicturePublicAccess(p.pictureId)
            publicAccessResActions.refetch()
          }}
        >
          Remove public access
        </Button>
      </Show>
      <Show when={userAccessRes()}>
        {users => (
          <Stack d="v" dist="xs">
            <For each={users}>
              {user => (
                <Stack dist="xs" a="center">
                  <T t="s">{user.name}</T>
                  <Button
                    onClick={async () => {
                      await apiAdminUsersRemovePictureAccess(
                        [user.id],
                        p.pictureId,
                      )
                      userAccessResActions.refetch()
                    }}
                  >
                    Remove access
                  </Button>
                </Stack>
              )}
            </For>
          </Stack>
        )}
      </Show>
    </Stack>
  )
}
