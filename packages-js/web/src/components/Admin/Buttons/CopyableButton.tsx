import { createSignal, JSX, mergeProps, ParentComponent } from "solid-js"
import * as s from "./CopyableButton.css"

export interface CopyableButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onCopy: () => void
  labelCopied?: JSX.Element
}
export const CopyableButton: ParentComponent<CopyableButtonProps> = p => {
  p = mergeProps({ labelCopied: "Copied", children: "Copy" }, p)
  const [copied, setCopied] = createSignal(false)

  const onClick = () => {
    p.onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      {...p}
      disabled={copied() || p.disabled}
      classList={{ [s.copyablebutton]: true, ...p.classList }}
      onClick={onClick}
    >
      {!copied() ? p.children : p.labelCopied}
    </button>
  )
}
