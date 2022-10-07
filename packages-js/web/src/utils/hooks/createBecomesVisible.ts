import { createEffect } from "solid-js"

export const createBecomesVisible = <TElt extends HTMLElement = HTMLDivElement>(
  onBecomesVisible?: () => void,
  disconnectAfterVisible = true,
) => {
  let eltRef: TElt | undefined
  const observer = new IntersectionObserver(ev => {
    if (!ev[0]?.isIntersecting) return
    onBecomesVisible?.()
    if (!disconnectAfterVisible) return
    observer.disconnect()
  })
  createEffect(() => eltRef && onBecomesVisible && observer.observe(eltRef))
  return (elt: TElt) => (eltRef = elt)
}
