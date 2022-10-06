import { Link } from "solid-app-router"
import { For, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { Stack } from "../Stack/Stack"
import { Picture } from "./PictureComponent"
import { PictureMetadata } from "./PictureMetadata"

interface PictureGridProps {
  pictures: PictureApi[]
}
export const PictureGrid: VoidComponent<PictureGridProps> = p => {
  return (
    <Stack wrap>
      <For each={p.pictures}>
        {picture => (
          <Stack d="v" fgColor="g10" style={{ width: "30%" }}>
            {props => (
              <Link href={`/picture/${picture.id}`} {...props}>
                <Picture picture={picture} sizes="28vw" />
                <PictureMetadata picture={picture} />
              </Link>
            )}
          </Stack>
        )}
      </For>
    </Stack>
  )
}
