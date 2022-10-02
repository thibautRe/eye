import { HttpError } from "../utils/errors"
import { apiClientHeaders } from "./client"

const assert_status_200 = (res: Response) => {
  if (res.status !== 200) throw new HttpError(res)
  return res
}

export const get = async (route: string) =>
  assert_status_200(await fetch(route, { headers: apiClientHeaders }))
export const get_json = async <T = unknown>(route: string): Promise<T> =>
  (await (await get(route)).json()) as T
