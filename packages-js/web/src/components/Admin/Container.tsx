import { ParentComponent } from "solid-js"
import { Stack } from "../Stack/Stack"
import * as s from "./Container.css"

export const AdminContainer: ParentComponent = p => {
  return (
    <Stack class={s.container} p="m">
      {p.children}
    </Stack>
  )
}
