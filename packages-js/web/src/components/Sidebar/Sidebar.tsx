import { ParentComponent, Show, Suspense } from "solid-js"
import { Portal } from "solid-js/web"
import { Box } from "../Box/Box"
import { sidebar } from "./Sidebar.css"

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}
export const Sidebar: ParentComponent<SidebarProps> = p => {
  return (
    <Suspense>
      <Show when={p.isOpen}>
        <SidebarPortal>
          <Box class={sidebar} bgColor="g3" br="l">
            {p.children}
          </Box>
        </SidebarPortal>
      </Show>
    </Suspense>
  )
}

const SidebarPortal: ParentComponent = p => {
  return <Portal>{p.children}</Portal>
}
