import { createResource, Show } from "solid-js"
import { apiAdminUsers } from "../../../api"
import { AdminContainer } from "../../Admin/Container"
import { PageTitle } from "../../Admin/PageTitle"
import { UserList } from "../../AdminUserList"
import { Stack } from "../../Stack/Stack"

export default () => {
  const [usersRes] = createResource(apiAdminUsers)
  return (
    <Show when={usersRes()} fallback="No users">
      <AdminContainer>
        <Stack d="v" dist="m" a="start">
          <PageTitle>Users</PageTitle>
          <UserList users={usersRes()!} />
        </Stack>
      </AdminContainer>
    </Show>
  )
}
