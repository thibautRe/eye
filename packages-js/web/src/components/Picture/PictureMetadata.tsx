import { Show, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { Stack } from "../Stack/Stack"

export interface PictureMetadataProps {
  picture: PictureApi
}
type PictureMetadataComponent = VoidComponent<PictureMetadataProps>

export const PictureIso: PictureMetadataComponent = props => (
  <Show when={props.picture.shotWithIso}>
    <span>ISO-{props.picture.shotWithIso}</span>
  </Show>
)

export const PictureAperture: PictureMetadataComponent = props => (
  <Show when={props.picture.shotWithAperture}>
    <span>f/{props.picture.shotWithAperture}</span>
  </Show>
)

const parseExposure = (exposure: string) => {
  const expF = parseFloat(exposure)
  if (expF < 1) return `1/${1 / expF}s`
  return `${expF}"`
}
export const PictureExposure: PictureMetadataComponent = props => (
  <Show when={props.picture.shotWithExposureTime}>
    {exp => <span>{parseExposure(exp)}</span>}
  </Show>
)

export const PictureFocalLength: PictureMetadataComponent = props => (
  <Show when={props.picture.shotWithFocalLength}>
    <span>{props.picture.shotWithFocalLength}mm</span>
  </Show>
)
export const PictureShotAt: PictureMetadataComponent = props => (
  <Show when={props.picture.shotAt}>
    {shotAt => <span>{shotAt.toString()}</span>}
  </Show>
)

export const PictureMetadata: PictureMetadataComponent = props => (
  <Show
    when={
      props.picture.shotAt ||
      props.picture.shotWithIso ||
      props.picture.shotWithAperture ||
      props.picture.shotWithExposureTime ||
      props.picture.shotWithFocalLength
    }
  >
    <Stack d="v" dist="xs">
      <Stack dist="xs">
        <PictureIso picture={props.picture} />
        <PictureAperture picture={props.picture} />
        <PictureFocalLength picture={props.picture} />
        <PictureExposure picture={props.picture} />
      </Stack>
      <PictureShotAt picture={props.picture} />
    </Stack>
  </Show>
)
