import { User } from "../types/user"
import { apiClientHeaders as headers } from "./client"

const routes = {
  adminJwtGen: `/api/admin/jwt_gen`,
  adminUsers: `/api/admin/users`,
}

const assert_status_200 = (res: Response) => {
  if (res.status !== 200)
    throw new Error(
      `Request failed with status: ${res.status} (${res.statusText})`,
    )
}

export const apiAdminJwtGen = async (): Promise<string> => {
  const res = await fetch(routes.adminJwtGen, { headers })
  assert_status_200(res)
  return await res.text()
}
export const apiAdminUsers = async (): Promise<User[]> => {
  const res = await fetch(routes.adminUsers, { headers })
  assert_status_200(res)
  return await res.json()
}
