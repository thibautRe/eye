import { apiClientHeaders as headers } from "./client"

const routes = {
  genJwt: `/api/jwt_gen`,
}

export const apiGenJwt = async (): Promise<string> =>
  await (await fetch(routes.genJwt, { headers })).text()
