import { createSignal } from "solid-js"

export const createBooleanSignal = (defaultValue = false) => {
  const [signal, setSignal] = createSignal(defaultValue)
  return [
    signal,
    {
      set: setSignal,
      enable: () => setSignal(true),
      disable: () => setSignal(false),
      toggle: () => setSignal(s => !s),
    },
  ] as const
}
