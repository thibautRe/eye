import { VoidComponent, For } from "solid-js"
import { UserApi } from "../../types/user"
import { Stack } from "../Stack/Stack"
import { UserListHead } from "./UserListHead"
import { UserRow } from "./UserRow"

interface UserListProps {
  users: UserApi[]
}
export const UserList: VoidComponent<UserListProps> = p => {
  return (
    <Stack d="v" dist="xs">
      <UserListHead />
      <For each={p.users}>{user => <UserRow user={user} />}</For>
    </Stack>
  )
}
