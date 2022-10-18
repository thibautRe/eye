import { HttpError } from "../utils/errors"
import { apiClientHeaders } from "./client"

const assert_status_200 = (res: Response) => {
  if (res.status !== 200) throw new HttpError(res)
  return res
}

export const get = async (route: string) =>
  assert_status_200(await fetch(route, { headers: apiClientHeaders }))
export const post = async <T>(route: string, data: T) =>
  assert_status_200(
    await fetch(route, {
      headers: { ...apiClientHeaders, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(data),
    }),
  )
export const get_json = async <T = unknown>(route: string): Promise<T> =>
  (await (await get(route)).json()) as T

export const withParams = <
  T extends Record<string, string | number | undefined>,
>(
  route: string,
  params: T,
) => {
  // @ts-expect-error Record<string,number> is not assignable to URLSearchParams
  const sp = new URLSearchParams(params).toString()
  return sp ? `${route}?${sp}` : route
}
