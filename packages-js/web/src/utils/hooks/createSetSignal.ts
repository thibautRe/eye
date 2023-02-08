import { createSignal } from "solid-js"

export const createSetSignal = <T>(initValue = new Set<T>()) => {
  const [signal, setSignal] = createSignal<ReadonlySet<T>>(initValue)

  const actions = {
    clear: () => setSignal(new Set<T>()),
    add: (...t: T[]) => setSignal(s => new Set([...s, ...t])),
    delete: (...t: T[]) =>
      setSignal(s => {
        const newS = new Set(s)
        t.forEach(t => newS.delete(t))
        return newS
      }),
    toggle: (...t: T[]) =>
      setSignal(s => {
        const newS = new Set(s)
        t.forEach(t => {
          const deleted = newS.delete(t)
          if (!deleted) newS.add(t)
        })
        return newS
      }),
  }

  return [signal, actions] as const
}
