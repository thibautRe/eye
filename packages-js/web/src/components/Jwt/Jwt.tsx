import clipboardCopy from "clipboard-copy"
import { createSignal, VoidComponent } from "solid-js"
import { Box } from "../Box/Box"
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

  const [copied, setCopied] = createSignal(false)
  const copy = () => {
    clipboardCopy(p.jwt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Stack dist="xs">
      <T t="xs" class={jwt}>
        <Box fgColor="amber11">{p => <span {...p}>{jwtp1()}</span>}</Box>.
        <Box fgColor="amber12">{p => <span {...p}>{jwtp2()}</span>}</Box>.
        <Box fgColor="amber11">{p => <span {...p}>{jwtp3()}</span>}</Box>
      </T>
      <button
        style={{ "min-width": "60px" }}
        disabled={copied()}
        onClick={copy}
      >
        {copied() ? "Copied" : "Copy"}
      </button>
    </Stack>
  )
}
