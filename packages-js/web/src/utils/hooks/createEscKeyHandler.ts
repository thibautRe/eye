import { createEffect, createSignal, onCleanup } from "solid-js"
import { createBooleanSignal } from "./createBooleanSignal"

const handlers: (() => void)[] = []
const addHandler = (handler: () => void) => {
  if (handlers.includes(handler)) return
  handlers.push(handler)
}
const removeHandler = (handler: () => void) => {
  const index = handlers.indexOf(handler)
  if (index === -1) return
  handlers.splice(index, 1)
}

document.addEventListener("keydown", e => {
  if (e.keyCode !== 27 || handlers.length === 0) return
  handlers[handlers.length - 1]()
})

/**
 * Creates a boolean signal controlled by the ESC key. The ESC key controller
 * makes sure that only one "close" callback is called at a time, enabling stacked
 * interactive element to open inside one another. The most recent item set to `true`
 * is the one that will be the first affected.
 * 
 * It has the same API as `createBooleanSignal`
 **/
export const createEscKeySignal = (defaultValue = false) => {
  const [signal, actions] = createBooleanSignal(defaultValue)
  const handler = actions.disable
  createEffect(() => (signal() ? addHandler(handler) : removeHandler(handler)))
  onCleanup(() => removeHandler(handler))
  return [signal, actions] as const
}
