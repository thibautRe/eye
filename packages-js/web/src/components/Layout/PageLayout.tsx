import { ParentComponent } from "solid-js"
import { Stack } from "../Stack/Stack"
import { Footer } from "./Footer"
import { Header } from "./Header"

export const PageLayout: ParentComponent = p => {
  return (
    <Stack d="v">
      <Header />
      <main>{p.children}</main>
      <Footer />
    </Stack>
  )
}
