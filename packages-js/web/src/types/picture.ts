import { Id } from "./id"

export interface PictureSizeApi {
  width: Id<"picture-size">
  height: number
  url: string
}
export interface CameraLens {
  id: Id<"camera-lens">
  name: string
}
export interface PictureApi {
  id: Id<"picture">
  width: number
  height: number
  name: string
  alt: string
  blurhash: string
  sizes: PictureSizeApi[]

  shotWithCameraLens?: CameraLens
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
