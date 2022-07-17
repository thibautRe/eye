import { createResource, Show } from "solid-js"
import { apiJwtGen } from "../../../api"
import { Jwt } from "../../Jwt/Jwt"
import { Stack } from "../../Stack/Stack"
import { T } from "../../T/T"

export default () => {
  const [jwtRes] = createResource(apiJwtGen)
  return (
    <Show when={jwtRes()} fallback="No JWT">
      <Stack p="s" style={{ "max-width": "450px" }}>
        <Stack dist="s" a="start">
          <T t="xs" pt="xs">
            Token
          </T>
          <Jwt jwt={jwtRes()!} />
        </Stack>
      </Stack>
    </Show>
  )
}
