import clipboardCopy from "clipboard-copy"
import { VoidComponent } from "solid-js"
import { apiAdminJwtGen } from "../../api"
import { makeAuthUrl } from "../../providers/Identity"
import { UserApi } from "../../types/user"
import { CopyableButton } from "../Admin/Buttons"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import * as s from "./UserList.css"

interface UserRowProps {
  user: UserApi
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
      <CopyableButton
        onCopy={async () => clipboardCopy(await apiAdminJwtGen(p.user.id))}
      >
        Copy token
      </CopyableButton>
      <CopyableButton
        onCopy={async () =>
          clipboardCopy(makeAuthUrl(await apiAdminJwtGen(p.user.id)))
        }
      >
        Copy URL
      </CopyableButton>
    </Stack>
  )
}
