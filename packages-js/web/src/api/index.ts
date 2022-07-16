import { apiClientHeaders as headers } from "./client"

const routes = {
  genJwt: `/api/jwt_gen`,
}

const assert_status_200 = (res: Response) => {
  if (res.status !== 200)
    throw new Error(
      `Request failed with status: ${res.status} (${res.statusText})`,
    )
}

export const apiGenJwt = async (): Promise<string> => {
  const res = await fetch(routes.genJwt, { headers })
  assert_status_200(res)
  return await res.text()
}
