import { Id } from "./id"

export interface PictureSizeApi {
  readonly width: number
  readonly height: number
  readonly url: string
}
export interface CameraLens {
  readonly id: Id<"camera-lens">
  readonly name: string
}
export interface PictureApi {
  readonly id: Id<"picture">
  readonly width: number
  readonly height: number
  readonly name: string
  readonly alt: string
  readonly blurhash: string
  readonly sizes: readonly PictureSizeApi[]
  readonly original: PictureSizeApi

  readonly shotWithCameraLens?: CameraLens
  readonly shotAt?: Date
  readonly shotWithAperture?: string
  readonly shotWithFocalLength?: number
  /** Exposure time in ms */
  readonly shotWithExposureTime?: string
  readonly shotWithIso?: number
}

export const parsePicture = (pic: PictureApi): PictureApi => ({
  ...pic,
  shotAt: pic.shotAt && new Date(pic.shotAt),
})
