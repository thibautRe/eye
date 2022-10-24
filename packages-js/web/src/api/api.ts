import { User } from "../providers/Identity"
import { AlbumApi, parseAlbum } from "../types/album"
import { PictureApi, parsePicture } from "../types/picture"
import { makePaginatedApi } from "./pagination"
import { get, get_json, post, withParams } from "./utils"

const routes = {
  pictures: `/api/pictures`,
  picture: (id: PictureApi["id"]) => `/api/picture/${id}`,
  albums: `/api/albums`,
  album: (id: AlbumApi["id"]) => `/api/album/${id}`,
  adminJwtGen: `/api/admin/jwt_gen`,
  adminUsers: `/api/admin/users`,

  addAlbumPictures: (id: AlbumApi["id"]) => `/api/album/${id}/add_pictures`,
} as const

export const apiGetPictures = makePaginatedApi<
  PictureApi,
  { albumId?: number; notAlbumId?: number }
>(routes.pictures, parsePicture)
export const apiGetAlbums = makePaginatedApi<AlbumApi>(
  routes.albums,
  parseAlbum,
)

export const apiGetPicture = (id: PictureApi["id"]) =>
  get_json<PictureApi>(routes.picture(id)).then(parsePicture)
export const apiGetAlbum = (id: AlbumApi["id"]) =>
  get_json<AlbumApi>(routes.album(id)).then(parseAlbum)
export const apiAdminUsers = () => get_json<User[]>(routes.adminUsers)
export const apiAdminJwtGen = async (userId = 1, withAdminRole = false) =>
  await (
    await get(withParams(routes.adminJwtGen, { userId, withAdminRole }))
  ).text()

export const apiAddAlbumPictures = async (
  albumId: AlbumApi["id"],
  pictureIds: PictureApi["id"][],
) => {
  await post(routes.addAlbumPictures(albumId), pictureIds)
}
