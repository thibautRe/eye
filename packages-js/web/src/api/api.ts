import { AlbumApi, parseAlbum } from "../types/album"
import { PictureApi, parsePicture } from "../types/picture"
import { PostApi, PostContent, parsePost } from "../types/post"
import { UserApi } from "../types/user"
import { makeCachedPaginatedApi } from "./pagination"
import {
  delete_http,
  get,
  get_json,
  makeCachedGet,
  post,
  put_json,
  withParams,
} from "./utils"

const routes = {
  pictures: `/api/pictures/`,
  picture: (id: PictureApi["id"]) => `/api/pictures/${id}`,
  pictureUpload: `/api/pictures/upload/`,
  pictureUserAccess: (id: PictureApi["id"]) =>
    `/api/pictures/${id}/user_access/`,
  picturePublicAccess: (id: PictureApi["id"]) =>
    `/api/pictures/${id}/public_access/`,

  albums: `/api/albums/`,
  albumCreate: `/api/albums/`,
  album: (id: AlbumApi["id"]) => `/api/albums/${id}`,
  albumDelete: (id: AlbumApi["id"]) => `/api/albums/${id}`,
  albumPictures: (id: AlbumApi["id"]) => `/api/albums/${id}/pictures/`,
  albumUserAccess: (id: AlbumApi["id"]) => `/api/albums/${id}/user_access/`,
  albumPublicAccess: (id: AlbumApi["id"]) => `/api/albums/${id}/public_access/`,

  posts: `/api/posts/`,
  postCreate: `/api/posts/`,
  post: (slug: PostApi["slug"]) => `/api/posts/${slug}/`,
  postSlugUpdate: (slug: PostApi["slug"]) => `/api/posts/${slug}/slug/`,

  users: `/api/users/`,
  userCreate: `/api/users/`,
  userJwt: (id: UserApi["id"]) => `/api/users/${id}/jwt`,
} as const

export type GetPicturesProps = { albumId?: number; notAlbumId?: number }
export const apiGetPictures = makeCachedPaginatedApi<
  PictureApi,
  GetPicturesProps
>(routes.pictures, parsePicture)
export const apiGetAlbums = makeCachedPaginatedApi<AlbumApi>(
  routes.albums,
  parseAlbum,
)

const [getPictureCached] = makeCachedGet<PictureApi>()
export const apiGetPicture = async (id: PictureApi["id"]) =>
  parsePicture(await getPictureCached(routes.picture(id)))
export const apiUploadPictures = async (fileList: FileList) => {
  const formData = new FormData()
  for (const file of fileList) {
    formData.append("files", file)
  }
  await post(routes.pictureUpload, formData)
}

const [getAlbumCached] = makeCachedGet<AlbumApi>()
export const apiGetAlbum = async (id: AlbumApi["id"]) =>
  parseAlbum(await getAlbumCached(routes.album(id)))

const [getPostCached] = makeCachedGet<PostApi>()
export const apiGetPost = async (slug: PostApi["slug"]) =>
  parsePost(await getPostCached(routes.post(slug)))
export const apiGetPosts = makeCachedPaginatedApi<PostApi>(
  routes.posts,
  parsePost,
)
export const apiCreatePost = async (slug: string, title: string) =>
  await post(routes.postCreate, { slug, title })
export const apiUpdatePost = async (
  slug: PostApi["slug"],
  update: { title: string; content: PostContent },
) => parsePost(await put_json(routes.post(slug), update))
export const apiUpdatePostSlug = async (
  prevSlug: PostApi["slug"],
  newSlug: PostApi["slug"],
) => parsePost(await put_json(routes.postSlugUpdate(prevSlug), newSlug))

export const apiAdminUsers = () => get_json<UserApi[]>(routes.users)
export const apiAdminCreateUser = async (name: string) =>
  await post(routes.userCreate, { name, email: `${name}@example.com` })
export const apiAdminJwtGen = async (userId = 1, withAdminRole = false) =>
  await (
    await get(withParams(routes.userJwt(userId), { withAdminRole }))
  ).text()

export const apiAdminGetUsersPictureAccess = async (
  pictureId: PictureApi["id"],
) => await get_json<UserApi[]>(routes.pictureUserAccess(pictureId))
export const apiAdminUsersAddPictureAccess = async (
  userIds: UserApi["id"][],
  pictureId: PictureApi["id"],
) => await post(routes.pictureUserAccess(pictureId), userIds)
export const apiAdminUsersRemovePictureAccess = async (
  userIds: UserApi["id"][],
  pictureId: PictureApi["id"],
) => await delete_http(routes.pictureUserAccess(pictureId), userIds)
export const apiAdminUserAddAlbumAccess = async (
  userIds: UserApi["id"][],
  albumId: AlbumApi["id"],
) => await post(routes.albumUserAccess(albumId), userIds)
export const apiAdminUserRemoveAlbumAccess = async (
  userIds: UserApi["id"][],
  albumId: AlbumApi["id"],
) => await delete_http(routes.albumUserAccess(albumId), userIds)

export const apiAdminGetPicturePublicAccess = async (
  pictureId: PictureApi["id"],
) => await get_json<boolean>(routes.picturePublicAccess(pictureId))
export const apiAdminSetPicturePublicAccess = async (
  pictureId: PictureApi["id"],
) => await post(routes.picturePublicAccess(pictureId))
export const apiAdminRemovePicturePublicAccess = async (
  pictureId: PictureApi["id"],
) => await delete_http(routes.picturePublicAccess(pictureId))

export const apiAdminSetAlbumPublicAccess = async (albumId: AlbumApi["id"]) =>
  await post(routes.albumPublicAccess(albumId))
export const apiAdminRemoveAlbumPublicAccess = async (
  albumId: AlbumApi["id"],
) => await delete_http(routes.albumPublicAccess(albumId))

export const apiCreateAlbum = async (name: string) =>
  await post(routes.albumCreate, { name })
export const apiAddAlbumPictures = async (
  albumId: AlbumApi["id"],
  pictureIds: PictureApi["id"][],
) => {
  await post(routes.albumPictures(albumId), pictureIds)
}
export const apiDeleteAlbum = async (albumId: AlbumApi["id"]) =>
  await delete_http(routes.albumDelete(albumId))

export const apiDeleteAlbumPictures = async (
  albumId: AlbumApi["id"],
  pictureIds: PictureApi["id"][],
) => {
  await delete_http(routes.albumPictures(albumId), pictureIds)
}
