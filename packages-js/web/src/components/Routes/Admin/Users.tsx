import { createResource } from "solid-js"
import { apiAdminUsers } from "../../../api"
import { AdminContainer } from "../../Admin/Container"
import { UserList } from "../../AdminUserList"
import { Stack } from "../../Stack/Stack"

export default () => {
  const [usersRes] = createResource(apiAdminUsers)
  return (
    <AdminContainer>
      <Stack d="v" dist="m" a="start">
        <h1>Users</h1>
        <UserList users={usersRes()!} />
      </Stack>
    </AdminContainer>
  )
}
