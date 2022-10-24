import { createResource, Show } from "solid-js"
import { apiAdminJwtGen } from "../../../api"
import { AdminContainer } from "../../Admin/Container"
import { PageTitle } from "../../Admin/PageTitle"
import { Jwt } from "../../Jwt/Jwt"
import { Stack } from "../../Stack/Stack"
import { T } from "../../T/T"

export default () => {
  const [jwtRes] = createResource(() => apiAdminJwtGen(1, true))
  return (
    <Show when={jwtRes()} fallback="No JWT">
      <AdminContainer>
        <Stack d="v" dist="m">
          <PageTitle>JWT Gen</PageTitle>
          <Stack dist="s">
            <T t="xs" pt="xs">
              Token
            </T>
            <Jwt jwt={jwtRes()!} />
          </Stack>
        </Stack>
      </AdminContainer>
    </Show>
  )
}
