import { VoidComponent } from "solid-js"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import * as s from "./UserList.css"

export const UserListHead: VoidComponent = p => {
  return (
    <Stack dist="xs">
      <T t="s" class={s.idRow}>
        ID
      </T>
      <T t="s" class={s.nameRow}>
        Name
      </T>
      <T t="s" class={s.emailRow}>
        Email
      </T>
    </Stack>
  )
}
