import { get_json, makeCachedGet, withParams } from "./utils"

export interface PaginatedApi<T> {
  items: T[]
  info: {
    nextPage: number | null
    totalCount: number
    totalPages: number
  }
}

export interface PaginatedLoaderProps {
  readonly page: number
}

export type PaginatedApiLoader<T, P> = (
  loaderProps: PaginatedLoaderProps,
  extraProps?: P,
) => Promise<PaginatedApi<T>>

export const makePaginatedApi =
  <T, P extends Record<string, number | string> = {}>(
    route: string,
    mapper?: (item: T) => T,
  ): PaginatedApiLoader<T, P> =>
  async (loaderProps, extraProps) => {
    const res = await get_json<PaginatedApi<T>>(
      withParams(route, { ...loaderProps, ...extraProps }),
    )
    return mapper ? mapPaginated(mapper)(res) : res
  }

export const makeCachedPaginatedApi = <
  T,
  P extends Record<string, number | string> = {},
>(
  route: string,
  mapper?: (item: T) => T,
): PaginatedApiLoader<T, P> => {
  const [getCached] = makeCachedGet<PaginatedApi<T>>()
  return async (loaderProps, extraProps) => {
    const res = await getCached(
      withParams(route, { ...loaderProps, ...extraProps }),
    )
    return mapper ? mapPaginated(mapper)(res) : res
  }
}

export const mapPaginated =
  <T>(mapper: (item: T) => T) =>
  (r: PaginatedApi<T>): PaginatedApi<T> => {
    return { ...r, items: r.items.map(i => mapper(i)) }
  }
