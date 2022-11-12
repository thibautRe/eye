import { useParams } from "solid-app-router"
import {
  createResource,
  For,
  JSX,
  ParentComponent,
  Show,
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
import { Box } from "../Box/Box"
import { Button } from "../Button"
import { TextLink } from "../Button/TextLink"
import { PageLayout } from "../Layout/PageLayout"
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
    <PageLayout
      adminToolbarItems={
        <Show when={pictureRes()}>
          {picture => <PictureUserAccessActions pictureId={picture.id} />}
        </Show>
      }
    >
      <Stack d="v" dist="m">
        <Show when={pictureRes()}>
          {picture => (
            <Stack d="v" dist="xl">
              <PictureItem picture={picture} />
            </Stack>
          )}
        </Show>
      </Stack>
    </PageLayout>
  )
}

const PictureActions: VoidComponent<{ picture: PictureApi }> = p => {
  const t = useTrans()
  const highestResSize = p.picture.sizes
    .slice()
    .sort((p1, p2) => p2.width - p1.width)[0]
  return (
    <Stack dist="m" a="center">
      <TextLink rel="external" href={highestResSize.url}>
        {t("fullResolution")}
      </TextLink>
      <TextLink rel="external" href={highestResSize.url} download>
        {t("download")}
      </TextLink>
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
    <Stack d="v" dist="xs">
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
                  <T t="xs">{user.name}</T>
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

const PictureItem: VoidComponent<{ picture: PictureApi }> = p => {
  return (
    <Stack d="v" dist="l" a="center" fgColor="g10">
      <Box
        style={{
          width: `${(p.picture.width / p.picture.height) * 100}vh`,
          "max-width": "100%",
        }}
        ref={boxRef => requestAnimationFrame(() => boxRef?.scrollIntoView?.())}
      >
        <AspectRatio aspectRatio={p.picture.width / p.picture.height}>
          <Picture picture={p.picture} sizes="90vw" />
        </AspectRatio>
      </Box>
      <PictureMetadata picture={p.picture} />
      <PictureActions picture={p.picture} />
    </Stack>
  )
}
