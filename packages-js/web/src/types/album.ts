import { Id } from "./id"
import { parsePicture, PictureApi } from "./picture"

export interface AlbumApi {
  id: Id<"album">
  name: string
  createdAt: Date
  updatedAt: Date
  picturesAmt: number
  picturesExcerpt: PictureApi[]
}

export const parseAlbum = (album: AlbumApi): AlbumApi => ({
  ...album,
  createdAt: new Date(album.createdAt),
  updatedAt: new Date(album.updatedAt),
  picturesExcerpt: album.picturesExcerpt.map(parsePicture),
})
