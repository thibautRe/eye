import { apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"

export default () => {
  const loader = createPaginatedLoader(apiGetPictures)
  return <PictureGridPaginated ph="s" pv="m" loader={loader} />
}
