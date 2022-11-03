import { JSX, VoidComponent } from "solid-js"
import { createEscKeySignal } from "../../utils/hooks/createEscKeyHandler"
import { Sidebar } from "./Sidebar"

export interface SidebarButtonProps {
  renderButton: (props: { onClick: () => void }) => JSX.Element
  renderChildren: (props: { onClose: () => void }) => JSX.Element
}
/** Renders a button tied to a Sidebar component */
export const SidebarButton: VoidComponent<SidebarButtonProps> = p => {
  const [isOpen, { enable: open, disable: close }] = createEscKeySignal()
  return (
    <>
      {p.renderButton({ onClick: open })}
      <Sidebar isOpen={isOpen()} onClose={close}>
        {p.renderChildren({ onClose: close })}
      </Sidebar>
    </>
  )
}
