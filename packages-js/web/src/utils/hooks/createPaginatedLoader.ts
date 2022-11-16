import { Accessor, createEffect, createSignal } from "solid-js"
import { PaginatedApiLoader } from "../../api/pagination"

interface PaginatedSignal<T> {
  readonly items: readonly T[]
  readonly error?: any
  readonly nextPage: number | null
  readonly shouldLoadNextPage: boolean
  readonly isLoadingNextPage: boolean
}

const cached = new Map<
  string,
  { items: readonly any[]; nextPage: number | null }
>()

export interface PaginatedLoader<T> {
  readonly data: Accessor<PaginatedSignal<T>>
  readonly onReload: () => void

  readonly onLoadNext: () => void
  readonly onLoadNextContinuous: () => void
  readonly onLoadNextContinuousAbort: () => void
}

interface CreatePaginatedLoaderParams<T, P extends {}> {
  loader: PaginatedApiLoader<T, P>
  params?: P
  cacheKey?: Accessor<string>
}
export const createPaginatedLoader = <T, P extends {}>(
  params: CreatePaginatedLoaderParams<T, P>,
): PaginatedLoader<T> => {
  const initSignal: PaginatedSignal<T> = {
    ...(params.cacheKey && cached.has(params.cacheKey())
      ? { ...cached.get(params.cacheKey())!, shouldLoadNextPage: false }
      : {
          items: [],
          nextPage: 1,
          shouldLoadNextPage: true,
        }),
    isLoadingNextPage: false,
  }
  const [signal, setSignal] = createSignal<PaginatedSignal<T>>(initSignal)
  let keepLoading = false

  createEffect(async () => {
    const {
      nextPage,
      shouldLoadNextPage,
      isLoadingNextPage,
      items: oldItems,
    } = signal()
    if (!(nextPage !== null && shouldLoadNextPage && !isLoadingNextPage)) return

    setSignal(p => ({ ...p, isLoadingNextPage: true, status: "loading" }))

    try {
      const res = await params.loader({ page: nextPage }, params.params)
      const items = [...oldItems, ...res.items]
      if (params.cacheKey) {
        cached.set(params.cacheKey(), { items, nextPage: res.info.nextPage })
      }
      setSignal(p => ({
        ...p,
        items,
        nextPage: res.info.nextPage,
        isLoadingNextPage: false,
        shouldLoadNextPage: keepLoading,
      }))
    } catch (error) {
      console.error(error)
      setSignal(p => ({
        ...p,
        error,
        isLoadingNextPage: false,
        shouldLoadNextPage: false,
      }))
    }
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

  const data = () => {
    const sig = signal()
    if (sig.error) throw sig.error
    return sig
  }

  return {
    data,
    onLoadNext,
    onReload,
    onLoadNextContinuous,
    onLoadNextContinuousAbort,
  }
}
