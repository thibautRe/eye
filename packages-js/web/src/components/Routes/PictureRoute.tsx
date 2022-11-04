import { useParams } from "solid-app-router"
import { createResource, Show, VoidComponent } from "solid-js"
import { apiAdminUsersAddPictureAccess, apiGetPicture } from "../../api"
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
          <Stack d="v" fgColor="g10" a="center">
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
            <AdminFenceOptional>
              <SidebarButton
                renderButton={p => <Button {...p}>Grant user access</Button>}
                renderChildren={({ onClose }) => (
                  <UserSelectSidebar
                    onSelectUsers={async userIds => {
                      await apiAdminUsersAddPictureAccess(userIds, picture.id)
                      onClose()
                    }}
                  />
                )}
              />
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
