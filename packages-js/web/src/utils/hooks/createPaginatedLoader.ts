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
}
export const createPaginatedLoader = <T, P extends {} | undefined>(
  loader: PaginatedApiLoader<T, P>,
  params?: P,
): PaginatedLoader<T> => {
  const [signal, setSignal] = createSignal<PaginatedSignal<T>>({
    items: [],
    nextPage: 1,
    shouldLoadNextPage: true,
    isLoadingNextPage: false,
  })
  createEffect(async () => {
    const signalInfo = signal()
    if (
      signalInfo.nextPage !== null &&
      signalInfo.shouldLoadNextPage &&
      !signalInfo.isLoadingNextPage
    ) {
      const nextPage = signalInfo.nextPage
      setSignal(p => ({ ...p, isLoadingNextPage: true }))
      const res = await loader({ page: nextPage }, params)
      setSignal(p => ({
        items: [...p.items, ...res.items],
        nextPage: res.info.nextPage,
        shouldLoadNextPage: false,
        isLoadingNextPage: false,
      }))
    }
  })

  const onLoadNext = () => {
    setSignal(s => {
      if (s.isLoadingNextPage || s.shouldLoadNextPage) return s
      return { ...s, shouldLoadNextPage: true }
    })
  }

  return { data: signal, onLoadNext }
}
