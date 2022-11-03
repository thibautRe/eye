import { createResource, For, VoidComponent } from "solid-js"
import { apiAdminUsers } from "../../../api"
import { UserApi } from "../../../types/user"
import { createSetSignal } from "../../../utils/hooks/createSetSignal"
import { Box } from "../../Box/Box"
import { Button } from "../../Button"
import { Stack } from "../../Stack/Stack"

export interface UserSelectSidebarProps {
  onSelectUsers: (userIds: UserApi["id"][]) => void
}
export const UserSelectSidebar: VoidComponent<UserSelectSidebarProps> = p => {
  const [usersRes] = createResource(apiAdminUsers)
  const [userIds, { toggle }] = createSetSignal<UserApi["id"]>()

  return (
    <Stack d="v" dist="m" style={{ "max-height": "100%" }}>
      <Box p="m">{p => <h2 {...p}>Select users</h2>}</Box>
      <Stack d="v" dist="xs" p="m" style={{ flex: 1, "overflow-y": "auto" }}>
        <For each={usersRes() ?? []}>
          {user => (
            <Stack
              dist="m"
              pv="s"
              ph="m"
              br="m"
              fgColor="p12"
              bgColor={userIds().has(user.id) ? "p6" : "p1"}
              style={{ border: "none" }}
            >
              {props => (
                <button onClick={() => toggle(user.id)} {...props}>
                  {user.name}
                </button>
              )}
            </Stack>
          )}
        </For>
      </Stack>
      <Box p="m">
        <Button
          disabled={userIds().size === 0}
          onClick={() => p.onSelectUsers([...userIds()])}
        >
          Select {userIds().size} user(s)
        </Button>
      </Box>
    </Stack>
  )
}
