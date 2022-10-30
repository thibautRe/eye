import { AlbumApi, parseAlbum } from "../types/album"
import { PictureApi, parsePicture } from "../types/picture"
import { UserApi } from "../types/user"
import { makePaginatedApi } from "./pagination"
import { delete_http, get, get_json, post, withParams } from "./utils"

const routes = {
  pictures: `/api/pictures/`,
  picture: (id: PictureApi["id"]) => `/api/pictures/${id}`,

  albums: `/api/albums/`,
  albumCreate: `/api/albums/`,
  album: (id: AlbumApi["id"]) => `/api/albums/${id}`,
  albumDelete: (id: AlbumApi["id"]) => `/api/albums/${id}`,
  albumAddPictures: (id: AlbumApi["id"]) => `/api/albums/${id}/pictures`,
  albumDeletePictures: (id: AlbumApi["id"]) => `/api/albums/${id}/pictures`,

  users: `/api/users/`,
  userJwt: (id: UserApi["id"]) => `/api/users/${id}/jwt`,
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
export const apiAdminUsers = () => get_json<UserApi[]>(routes.users)
export const apiAdminJwtGen = async (userId = 1, withAdminRole = false) =>
  await (
    await get(withParams(routes.userJwt(userId), { withAdminRole }))
  ).text()

export const apiCreateAlbum = async (name: string) =>
  await post(routes.albumCreate, { name })
export const apiAddAlbumPictures = async (
  albumId: AlbumApi["id"],
  pictureIds: PictureApi["id"][],
) => {
  await post(routes.albumAddPictures(albumId), pictureIds)
}
export const apiDeleteAlbum = async (albumId: AlbumApi["id"]) =>
  await delete_http(routes.albumDelete(albumId))

export const apiDeleteAlbumPictures = async (
  albumId: AlbumApi["id"],
  pictureIds: PictureApi["id"][],
) => {
  await delete_http(routes.albumDeletePictures(albumId), pictureIds)
}
