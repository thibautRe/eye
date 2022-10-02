import { User } from "../providers/Identity"
import { AlbumApi, parseAlbum } from "../types/album"
import { PictureApi, parsePicture } from "../types/picture"
import { get, get_json } from "./utils"

const routes = {
  pictures: `/api/pictures`,
  picture: (id: PictureApi["id"]) => `/api/picture/${id}`,
  albums: `/api/albums`,
  album: (id: AlbumApi["id"]) => `/api/album/${id}`,
  adminJwtGen: `/api/admin/jwt_gen`,
  adminUsers: `/api/admin/users`,
} as const

export const apiGetPictures = () =>
  get_json<PictureApi[]>(routes.pictures).then(r => r.map(parsePicture))
export const apiGetPicture = (id: PictureApi["id"]) =>
  get_json<PictureApi>(routes.picture(id)).then(parsePicture)
export const apiGetAlbums = () =>
  get_json<AlbumApi[]>(routes.albums).then(r => r.map(parseAlbum))
export const apiGetAlbum = (id: AlbumApi["id"]) =>
  get_json<AlbumApi>(routes.album(id)).then(parseAlbum)
export const apiAdminUsers = () => get_json<User[]>(routes.adminUsers)
export const apiAdminJwtGen = async () =>
  await (await get(routes.adminJwtGen)).text()