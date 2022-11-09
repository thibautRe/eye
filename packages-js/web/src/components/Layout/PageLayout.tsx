import { JSX, lazy, ParentComponent, Suspense } from "solid-js"
import { StoredAdminFenceOptional } from "../AuthFence"
import { Stack } from "../Stack/Stack"
import { Footer } from "./Footer"
import { Header } from "./Header"

const LazyAdminToobar = lazy(() => import("../Admin/AdminToolbar/AdminToolbar"))

export interface PageLayoutProps {
  adminToolbarItems?: JSX.Element
}
export const PageLayout: ParentComponent<PageLayoutProps> = p => {
  return (
    <Stack d="v">
      <Header />
      <main>{p.children}</main>
      <Footer />

      <Suspense>
        <StoredAdminFenceOptional>
          <LazyAdminToobar>{p.adminToolbarItems}</LazyAdminToobar>
        </StoredAdminFenceOptional>
      </Suspense>
    </Stack>
  )
}
