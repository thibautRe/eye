import { For } from "solid-js"
import { apiCreatePost, apiGetPosts } from "../../../api"
import { createPaginatedLoader } from "../../../utils/hooks/createPaginatedLoader"
import { AdminContainer } from "../../Admin/Container"
import { PageTitle } from "../../Admin/PageTitle"
import { Button } from "../../Button"
import { Stack } from "../../Stack/Stack"

export default () => {
  const postsPaginated = createPaginatedLoader({
    loader: apiGetPosts,
    cacheKey: () => "posts",
  })
  return (
    <AdminContainer>
      <Stack dist="m" a="center" j="space-around">
        <PageTitle>Post</PageTitle>
        <Button
          onClick={async () => {
            const name = prompt("Post name")
            if (!name) return
            const slug = name.replaceAll(/[^a-z0-9]/gi, "-").toLocaleLowerCase()
            await apiCreatePost(slug)
            postsPaginated.onReload()
          }}
        >
          Add post
        </Button>
      </Stack>
      <Stack d="v">
        <For each={postsPaginated.data().items}>
          {post => (
            <Stack>
              {post.id} ({post.slug})
            </Stack>
          )}
        </For>
      </Stack>
    </AdminContainer>
  )
}
