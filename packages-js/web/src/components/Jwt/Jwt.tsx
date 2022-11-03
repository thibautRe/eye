import clipboardCopy from "clipboard-copy"
import { VoidComponent } from "solid-js"
import { updateIdentityX } from "../../providers/Identity"
import { Box } from "../Box/Box"
import { Button, CopyableButton } from "../Button"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import { jwt } from "./Jwt.css"

export interface JwtProps {
  jwt: string
}
export const Jwt: VoidComponent<JwtProps> = p => {
  const jwtp1 = () => p.jwt.split(".")[0]
  const jwtp2 = () => p.jwt.split(".")[1]
  const jwtp3 = () => p.jwt.split(".")[2]

  return (
    <Stack dist="xxs" bgColor="g5" fgColor="g7" ph="s" pv="xs" br="m">
      <T t="xs" class={jwt}>
        <Box fgColor="p11">{p => <span {...p}>{jwtp1()}</span>}</Box>.
        <Box fgColor="p12">{p => <span {...p}>{jwtp2()}</span>}</Box>.
        <Box fgColor="p11">{p => <span {...p}>{jwtp3()}</span>}</Box>
      </T>
      <Stack d="v" dist="xxs">
        <CopyableButton onCopy={() => clipboardCopy(p.jwt)} />
        <Button onClick={() => updateIdentityX(p.jwt)}>Use</Button>
      </Stack>
    </Stack>
  )
}
