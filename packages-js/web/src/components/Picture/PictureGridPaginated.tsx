import { splitProps, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { createBecomesVisible } from "../../utils/hooks/createBecomesVisible"
import { PaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { Stack } from "../Stack/Stack"
import { PictureGrid, PictureGridProps } from "./PictureGrid"
import { PicturePlaceholder } from "./PicturePlaceholder"

interface PictureGridPaginatedProps
  extends Omit<PictureGridProps, "pictures" | "extra"> {
  loader: PaginatedLoader<PictureApi>
}
export const PictureGridPaginated: VoidComponent<
  PictureGridPaginatedProps
> = p => {
  const [local, rest] = splitProps(p, ["loader", "children"])
  return (
    <PictureGrid
      pictures={local.loader.data().items}
      extra={
        local.loader.data().nextPage != null && (
          <>
            <PicturePlaceholder onBecomeVisible={local.loader.onLoadNext} />
            <PicturePlaceholder />
            <PicturePlaceholder />
            <PicturePlaceholder />
            <PicturePlaceholder />
            <PicturePlaceholder />
            <Stack style={{ height: "200vh" }} />
          </>
        )
      }
      {...rest}
    />
  )
}
