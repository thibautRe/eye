import { useParams } from "@solidjs/router"

export default () => {
  const params = useParams<{ slug: string }>()
  const [postRes, postResAction] = createResource(params.slug, apiGetPost)
}
