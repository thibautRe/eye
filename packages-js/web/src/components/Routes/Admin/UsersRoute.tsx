import { createResource, Show } from "solid-js"
import { apiAdminCreateUser, apiAdminUsers } from "../../../api"
import { AdminContainer } from "../../Admin/Container"
import { PageTitle } from "../../Admin/PageTitle"
import { UserList } from "../../AdminUserList"
import { Button } from "../../Button"
import { Stack } from "../../Stack/Stack"

export default () => {
  const [usersRes, usersResAction] = createResource(apiAdminUsers)
  return (
    <Show when={usersRes()} fallback="No users">
      <AdminContainer>
        <Stack d="v" dist="m">
          <Stack dist="m">
            <Button
              onClick={async () => {
                const name = prompt("User name")
                if (!name) return
                await apiAdminCreateUser(name)
                usersResAction.refetch()
              }}
            >
              Create user
            </Button>
          </Stack>
          <PageTitle>Users</PageTitle>
          <UserList users={usersRes()!} />
        </Stack>
      </AdminContainer>
    </Show>
  )
}
