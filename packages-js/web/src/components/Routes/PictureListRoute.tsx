import { apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { PageLayout } from "../Layout/PageLayout"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"

export default () => {
  const loader = createPaginatedLoader({
    loader: apiGetPictures,
    cacheKey: () => "picture-list-route",
  })
  return (
    <PageLayout>
      <PictureGridPaginated ph="s" pv="m" loader={loader} />
    </PageLayout>
  )
}
