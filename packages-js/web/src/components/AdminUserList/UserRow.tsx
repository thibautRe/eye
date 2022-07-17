import { VoidComponent } from "solid-js"
import { User } from "../../types/user"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import * as s from "./UserList.css"

interface UserRowProps {
  user: User
}
export const UserRow: VoidComponent<UserRowProps> = p => {
  return (
    <Stack dist="xs">
      <T t="s" class={s.idRow}>
        {p.user.id}
      </T>
      <T t="s" class={s.nameRow}>
        {p.user.name}
      </T>
      <T t="s" class={s.emailRow}>
        {p.user.name}
      </T>
    </Stack>
  )
}
