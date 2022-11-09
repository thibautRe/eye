import { splitProps, VoidComponent } from "solid-js"
import { PictureApi } from "../../types/picture"
import { createBecomesVisible } from "../../utils/hooks/createBecomesVisible"
import { PaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { Box } from "../Box/Box"
import { PictureGrid, PictureGridProps } from "./PictureGrid"
import { PicturePlaceholders } from "./PicturePlaceholder"

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
            <PicturePlaceholders />
            <Box
              style={{ height: "200vh" }}
              ref={createBecomesVisible({
                disconnectAfterVisible: false,
                onBecomesVisible: local.loader.onLoadNextContinuous,
                onBecomesInvisible: local.loader.onLoadNextContinuousAbort,
              })}
            />
          </>
        )
      }
      {...rest}
    />
  )
}
