import { ParentComponent, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { Box } from "../../Box/Box"
import { sidebar } from "./Sidebar.css"

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}
export const Sidebar: ParentComponent<SidebarProps> = p => {
  return (
    <Show when={p.isOpen}>
      <SidebarPortal>
        <Box class={sidebar} bgColor="g1" br="l">
          {p.children}
        </Box>
      </SidebarPortal>
    </Show>
  )
}

const SidebarPortal: ParentComponent = p => {
  return <Portal>{p.children}</Portal>
}
