import { apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"

export default () => {
  const loader = createPaginatedLoader(apiGetPictures)
  return <PictureGridPaginated loader={loader} />
}
