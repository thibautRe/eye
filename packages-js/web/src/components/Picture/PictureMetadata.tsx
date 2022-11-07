import { Show, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { Stack } from "../Stack/Stack"

export interface PictureMetadataProps {
  picture: PictureApi
}
type PictureMetadataComponent = VoidComponent<PictureMetadataProps>

export const PictureName: PictureMetadataComponent = props => (
  <Show when={props.picture.name}>
    <strong>{props.picture.name}</strong>
  </Show>
)
export const PictureIso: PictureMetadataComponent = props => (
  <Show when={props.picture.shotWithIso}>
    <span>ISO-{props.picture.shotWithIso}</span>
  </Show>
)

export const PictureAperture: PictureMetadataComponent = props => (
  <Show
    when={
      props.picture.shotWithAperture &&
      parseInt(props.picture.shotWithAperture, 10)
    }
  >
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
    {shotAt => <span>{shotAt.toLocaleDateString()}</span>}
  </Show>
)
export const PictureCameraLens: PictureMetadataComponent = props => (
  <Show when={props.picture.shotWithCameraLens}>
    {lens => <span>{lens.name}</span>}
  </Show>
)

export const PictureMetadata: PictureMetadataComponent = props => (
  <Stack d="v" dist="xs">
    <PictureName picture={props.picture} />
    <Stack dist="s">
      <PictureIso picture={props.picture} />
      <PictureAperture picture={props.picture} />
      <PictureFocalLength picture={props.picture} />
      <PictureExposure picture={props.picture} />
    </Stack>
    <PictureShotAt picture={props.picture} />
    <PictureCameraLens picture={props.picture} />
  </Stack>
)
