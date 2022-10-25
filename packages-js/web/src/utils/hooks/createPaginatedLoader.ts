import { Accessor, createEffect, createSignal } from "solid-js"
import { PaginatedApiLoader } from "../../api/pagination"

interface PaginatedSignal<T> {
  items: T[]
  nextPage: number | null
  shouldLoadNextPage: boolean
  isLoadingNextPage: boolean
}

export interface PaginatedLoader<T> {
  data: Accessor<PaginatedSignal<T>>
  onLoadNext: () => void
  onReload: () => void
}
export const createPaginatedLoader = <T, P extends {} | undefined>(
  loader: PaginatedApiLoader<T, P>,
  params?: P,
): PaginatedLoader<T> => {
  const initSignal: PaginatedSignal<T> = {
    items: [],
    nextPage: 1,
    shouldLoadNextPage: true,
    isLoadingNextPage: false,
  }
  const [signal, setSignal] = createSignal<PaginatedSignal<T>>(initSignal)

  createEffect(async () => {
    const signalInfo = signal()
    if (
      signalInfo.nextPage !== null &&
      signalInfo.shouldLoadNextPage &&
      !signalInfo.isLoadingNextPage
    ) {
      const nextPage = signalInfo.nextPage
      setSignal(p => ({
        ...p,
        isLoadingNextPage: true,
        shouldLoadNextPage: false,
      }))
      const res = await loader({ page: nextPage }, params)
      setSignal(p => ({
        ...p,
        items: [...p.items, ...res.items],
        nextPage: res.info.nextPage,
        isLoadingNextPage: false,
      }))
    }
  })

  const onLoadNext = () => {
    setSignal(s => {
      if (s.shouldLoadNextPage) return s
      return { ...s, shouldLoadNextPage: true }
    })
  }

  const onReload = () => setSignal(initSignal)

  return { data: signal, onLoadNext, onReload }
}
