import { AlbumApi, parseAlbum } from "../types/album"
import { parsePicture, PictureApi } from "../types/picture"
import { User } from "../types/user"
import { apiClientHeaders as headers } from "./client"

const routes = {
  pictures: `/api/pictures`,
  picture: (id: PictureApi["id"]) => `/api/picture/${id}`,
  album: (id: AlbumApi["id"]) => `/api/album/${id}`,
  adminJwtGen: `/api/admin/jwt_gen`,
  adminUsers: `/api/admin/users`,
} as const

const assert_status_200 = (res: Response) => {
  if (res.status !== 200)
    throw new Error(
      `Request failed with status: ${res.status} (${res.statusText})`,
    )
  return res
}

const get = async (route: string) =>
  assert_status_200(await fetch(route, { headers }))
const get_json = async <T = unknown>(route: string): Promise<T> =>
  (await (await get(route)).json()) as T

export const apiGetPictures = () =>
  get_json<PictureApi[]>(routes.pictures).then(r => r.map(parsePicture))
export const apiGetPicture = (id: PictureApi["id"]) =>
  get_json<PictureApi>(routes.picture(id)).then(parsePicture)
export const apiGetAlbum = (id: AlbumApi["id"]) =>
  get_json<AlbumApi>(routes.album(id)).then(parseAlbum)
export const apiAdminUsers = () => get_json<User[]>(routes.adminUsers)
export const apiAdminJwtGen = async () =>
  await (await get(routes.adminJwtGen)).text()
