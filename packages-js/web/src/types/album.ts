import { Id } from "./id"
import { parsePicture, PictureApi } from "./picture"

export interface AlbumApi {
  readonly id: Id<"album">
  readonly name: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly picturesAmt: number
  readonly picturesExcerpt: readonly PictureApi[]
}

export const parseAlbum = (album: AlbumApi): AlbumApi => ({
  ...album,
  createdAt: new Date(album.createdAt),
  updatedAt: new Date(album.updatedAt),
  picturesExcerpt: album.picturesExcerpt.map(parsePicture),
})
