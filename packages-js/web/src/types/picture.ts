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

  shotAt?: Date
  shotWithAperture?: string
  shotWithFocalLength?: number
  /** Exposure time in ms */
  shotWithExposureTime?: string
  shotWithIso?: number
}

export const parsePicture = (pic: PictureApi): PictureApi => ({
  ...pic,
  shotAt: pic.shotAt && new Date(pic.shotAt),
})
