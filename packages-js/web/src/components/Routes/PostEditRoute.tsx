import { useParams } from "@solidjs/router"
import { Show, createResource } from "solid-js"
import { apiGetPost } from "../../api"
import { PageLayout } from "../Layout/PageLayout"
import { Stack } from "../Stack/Stack"
import PostEdit from "../Post/PostEdit"

export default () => {
  const params = useParams<{ slug: string }>()
  const [postRes] = createResource(params.slug, apiGetPost)

  return (
    <PageLayout>
      <Show when={postRes()}>
        {post => (
          <Stack d="v">
            <PostEdit content={post().content} />
          </Stack>
        )}
      </Show>
    </PageLayout>
  )
}
