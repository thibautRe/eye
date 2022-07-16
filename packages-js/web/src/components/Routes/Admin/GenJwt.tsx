import { createResource } from "solid-js"
import { apiGenJwt } from "../../../api"

export default () => {
  const [res] = createResource(apiGenJwt)
  return <div>{res()}</div>
}
