import { createResource, Show } from "solid-js"
import { apiAdminJwtGen } from "../../../api"
import { AdminContainer } from "../../Admin/Container"
import { Jwt } from "../../Jwt/Jwt"
import { Stack } from "../../Stack/Stack"
import { T } from "../../T/T"

export default () => {
  const [jwtRes] = createResource(apiAdminJwtGen)
  return (
    <Show when={jwtRes()} fallback="No JWT">
      <AdminContainer>
        <Stack dist="s" a="start">
          <T t="xs" pt="xs">
            Token
          </T>
          <Jwt jwt={jwtRes()!} />
        </Stack>
      </AdminContainer>
    </Show>
  )
}
