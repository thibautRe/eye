import { apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { Box } from "../Box/Box"
import { AspectRatio } from "../Picture/AspectRatio"
import { PictureGrid } from "../Picture/PictureGrid"
import { PicturePlaceholder } from "../Picture/PicturePlaceholder"
import { Stack } from "../Stack/Stack"

export default () => {
  const picturesPaginated = createPaginatedLoader(apiGetPictures)
  return (
    <PictureGrid
      pictures={picturesPaginated.data().items}
      extra={
        picturesPaginated.data().nextPage != null && (
          <>
            <PicturePlaceholder
              onBecomeVisible={picturesPaginated.onLoadNext}
            />
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
