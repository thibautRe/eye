import { apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { PictureGrid } from "../Picture/PictureGrid"

export default () => {
  const picturesPaginated = createPaginatedLoader(apiGetPictures)
  return <PictureGrid pictures={picturesPaginated.data().items} />
}
