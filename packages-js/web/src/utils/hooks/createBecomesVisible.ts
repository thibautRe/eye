import { createEffect } from "solid-js"

export interface CreateBecomesVisibleProps {
  readonly onBecomesVisible?: () => void
  readonly onBecomesInvisible?: () => void
  readonly disconnectAfterVisible?: boolean
}
export const createBecomesVisible = <TElt extends HTMLElement = HTMLDivElement>(
  p: CreateBecomesVisibleProps,
) => {
  let eltRef: TElt | undefined
  const observer = new IntersectionObserver(ev => {
    if (!ev[0]?.isIntersecting) {
      p.onBecomesInvisible?.()
    } else {
      p.onBecomesVisible?.()
      if (!p.disconnectAfterVisible) return
      observer.disconnect()
    }
  })
  createEffect(() => eltRef && p.onBecomesVisible && observer.observe(eltRef))
  return (elt: TElt) => (eltRef = elt)
}
