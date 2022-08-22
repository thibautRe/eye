export interface PictureSizeApi {
  width: number
  height: number
  url: string
}
export interface PictureApi {
  id: number
  width: number
  height: number
  name: string
  alt: string
  blurhash: string
  sizes: PictureSizeApi[]

  shotWithAperture?: string
  shotWithFocalLength?: number
  /** Exposure time in ms */
  shotWithExposureTime?: string
  shotWithIso?: number
}
