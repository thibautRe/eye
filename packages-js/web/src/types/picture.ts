export interface PictureSizeApi {
  width: number,
  height: number
  url: string
}
export interface PictureApi {
  id: number
  name: string
  alt: string
  sizes: PictureSizeApi[]
}
