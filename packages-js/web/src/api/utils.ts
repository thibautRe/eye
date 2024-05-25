import { HttpError } from "../utils/errors"
import { apiClientHeaders } from "./client"

const assert_status_200 = (res: Response) => {
  if (res.status !== 200) throw new HttpError(res)
  return res
}
const headersWithJson = {
  ...apiClientHeaders,
  "Content-Type": "application/json",
}

export const get = async (route: string) =>
  assert_status_200(await fetch(route, { headers: apiClientHeaders }))
export const post = async <T,>(route: string, data?: T) =>
  assert_status_200(
    await fetch(route, {
      headers: data instanceof FormData ? apiClientHeaders : headersWithJson,
      method: "POST",
      body: data instanceof FormData ? data : data && JSON.stringify(data),
    }),
  )
export const put = async <T,>(route: string, data?: T) =>
  assert_status_200(
    await fetch(route, {
      headers: headersWithJson,
      method: "PUT",
      body: data && JSON.stringify(data),
    }),
  )
export const delete_http = async <T,>(route: string, data?: T) =>
  assert_status_200(
    await fetch(route, {
      headers: headersWithJson,
      method: "DELETE",
      body: JSON.stringify(data),
    }),
  )
export const get_json = async <T = unknown,>(route: string): Promise<T> =>
  (await (await get(route)).json()) as T
export const put_json = async <TData, T = unknown>(
  route: string,
  data?: TData,
): Promise<T> => (await (await put(route, data)).json()) as T

export const makeCachedGet = <T,>() => {
  const cache = new Map<string, T>()
  return [
    async (route: string) => {
      if (cache.has(route)) return cache.get(route)!
      const val = await get_json<T>(route)
      cache.set(route, val)
      return val
    },
    { cache: { clear: cache.clear } },
  ] as const
}

export const withParams = <
  T extends Record<string, string | number | boolean | undefined>,
>(
  route: string,
  params: T,
) => {
  // @ts-expect-error Record<string,number> is not assignable to URLSearchParams
  const sp = new URLSearchParams(params).toString()
  return sp ? `${route}?${sp}` : route
}
