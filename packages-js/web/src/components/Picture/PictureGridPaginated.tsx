import { VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { PaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { PictureGrid } from "./PictureGrid"
import { PicturePlaceholder } from "./PicturePlaceholder"

interface PictureGridPaginatedProps {
  loader: PaginatedLoader<PictureApi>
}
export const PictureGridPaginated: VoidComponent<
  PictureGridPaginatedProps
> = p => {
  return (
    <PictureGrid
      pictures={p.loader.data().items}
      extra={
        p.loader.data().nextPage != null && (
          <>
            <PicturePlaceholder onBecomeVisible={p.loader.onLoadNext} />
            <PicturePlaceholder />
            <PicturePlaceholder />
            <PicturePlaceholder />
            <PicturePlaceholder />
            <PicturePlaceholder />
          </>
        )
      }
    />
  )
}
