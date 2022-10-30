import { Accessor, createEffect, createSignal } from "solid-js"
import { PaginatedApiLoader } from "../../api/pagination"

interface PaginatedSignal<T> {
  items: T[]
  nextPage: number | null
  shouldLoadNextPage: boolean
  isLoadingNextPage: boolean
}

export interface PaginatedLoader<T> {
  readonly data: Accessor<PaginatedSignal<T>>
  readonly onReload: () => void

  readonly onLoadNext: () => void
  readonly onLoadNextContinuous: () => void
  readonly onLoadNextContinuousAbort: () => void
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
  let keepLoading = false

  createEffect(async () => {
    const { nextPage, shouldLoadNextPage, isLoadingNextPage } = signal()
    if (!(nextPage !== null && shouldLoadNextPage && !isLoadingNextPage)) return

    setSignal(p => ({ ...p, isLoadingNextPage: true }))
    const res = await loader({ page: nextPage }, params)
    setSignal(p => ({
      ...p,
      items: [...p.items, ...res.items],
      nextPage: res.info.nextPage,
      isLoadingNextPage: false,
      shouldLoadNextPage: keepLoading,
    }))
  })

  const onLoadNext = () => {
    setSignal(s => {
      if (s.shouldLoadNextPage) return s
      return { ...s, shouldLoadNextPage: true }
    })
  }
  const onLoadNextContinuous = () => {
    keepLoading = true
    onLoadNext()
  }

  const onLoadNextContinuousAbort = () => {
    keepLoading = false
  }

  const onReload = () => setSignal(initSignal)

  return {
    data: signal,
    onLoadNext,
    onReload,
    onLoadNextContinuous,
    onLoadNextContinuousAbort,
  }
}
