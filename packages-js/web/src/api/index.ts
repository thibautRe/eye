import { apiClientHeaders as headers } from "./client"

const routes = {
  genJwt: `/api/admin/jwt_gen`,
}

const assert_status_200 = (res: Response) => {
  if (res.status !== 200)
    throw new Error(
      `Request failed with status: ${res.status} (${res.statusText})`,
    )
}

export const apiJwtGen = async (): Promise<string> => {
  const res = await fetch(routes.genJwt, { headers })
  assert_status_200(res)
  return await res.text()
}
