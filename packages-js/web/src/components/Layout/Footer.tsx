import { VoidComponent } from "solid-js"
import { Stack } from "../Stack/Stack"

export const Footer: VoidComponent = () => {
  return (
    <Stack p="l" j="center" style={{ height: "150px" }}>
      {props => <footer {...props} />}
    </Stack>
  )
}
