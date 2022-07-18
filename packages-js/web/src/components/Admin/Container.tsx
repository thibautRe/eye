import { ParentComponent } from "solid-js"
import { Stack } from "../Stack/Stack"
import { AdminNav } from "./Nav"
import * as s from "./Container.css"
import { Box } from "../Box/Box"

export const AdminContainer: ParentComponent = p => {
  return (
    <Box p="m">
      <Stack dist="l" a="start">
        <AdminNav />
        <div class={s.container}>{p.children}</div>
      </Stack>
    </Box>
  )
}
