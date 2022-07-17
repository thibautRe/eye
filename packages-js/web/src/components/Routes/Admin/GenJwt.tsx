import { createResource, Show } from "solid-js"
import { apiGenJwt } from "../../../api"
import { Box } from "../../Box/Box"
import { Jwt } from "../../Jwt/Jwt"
import { Stack } from "../../Stack/Stack"
import { T } from "../../T/T"

export default () => {
  const [jwtRes] = createResource(apiGenJwt)
  return (
    <Show when={jwtRes()} fallback="No JWT">
      <Stack p="s" style={{ "max-width": "450px" }}>
        <Stack dist="s" bgColor="g4" br="m" ph="s" pv="xs" a="start">
          <T t="xs">Token</T>
          <Jwt jwt={jwtRes()!} />
        </Stack>
      </Stack>
    </Show>
  )
}
