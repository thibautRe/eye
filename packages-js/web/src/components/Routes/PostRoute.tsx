import { useParams } from "@solidjs/router"
import { PageLayout } from "../Layout/PageLayout"
import { Stack } from "../Stack/Stack"
import { Show, createResource } from "solid-js"
import { apiGetPost } from "../../api"
import { Box } from "../Box/Box"
import { routes } from "."
import { TextLink } from "../Button/TextLink"
import Post from "../Post"

export default () => {
  const params = useParams<{ slug: string }>()
  const [postRes] = createResource(params.slug, apiGetPost)
  return (
    <PageLayout
      adminToolbarItems={
        <TextLink href={routes.PostEdit(params.slug)}>Edit</TextLink>
      }
    >
      <Stack d="v" dist="m">
        <Show when={postRes()}>
          {post => (
            <Box style={{ width: "650px", margin: "auto" }}>
              <Post post={post()} />
            </Box>
          )}
        </Show>
      </Stack>
    </PageLayout>
  )
}
