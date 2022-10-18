import { createSignal } from "solid-js"

export const createSetSignal = <T>(initValue = new Set<T>()) => {
  const [signal, setSignal] = createSignal<ReadonlySet<T>>(initValue)

  return [
    signal,
    {
      clear: () => setSignal(new Set<T>()),
      add: (item: T) => setSignal(s => new Set(s).add(item)),
      delete: (item: T) =>
        setSignal(s => {
          const newS = new Set(s)
          newS.delete(item)
          return newS
        }),
      toggle: (item: T) =>
        setSignal(s => {
          const newS = new Set(s)
          const deleted = newS.delete(item)
          if (!deleted) newS.add(item)
          return newS
        }),
    },
  ] as const
}
