import { For } from "solid-js"
import { createPaginatedLoader } from "../../utils/hooks/createPaginatedLoader"
import { apiCreatePost, apiGetPosts } from "../../api"
import { Stack } from "../Stack/Stack"
import { PageTitle } from "../Admin/PageTitle"
import { Button } from "../Button"
import { PageLayout } from "../Layout/PageLayout"
import { A } from "@solidjs/router"

export default () => {
  const postsPaginated = createPaginatedLoader({
    loader: apiGetPosts,
    cacheKey: () => "posts",
  })
  return (
    <PageLayout
      adminToolbarItems={
        <Button
          onClick={async () => {
            const name = prompt("Post name")
            if (!name) return
            const slug = name.replaceAll(/[^a-z0-9]/gi, "-").toLocaleLowerCase()
            await apiCreatePost(slug, name)
            postsPaginated.onReload()
          }}
        >
          Add post
        </Button>
      }
    >
      <Stack dist="m" a="center" j="space-around">
        <PageTitle>Posts</PageTitle>
      </Stack>
      <Stack d="v">
        <For each={postsPaginated.data().items}>
          {post => (
            <Stack>
              {post.id} (<A href={`/p/${post.slug}`}>{post.slug}</A>)
            </Stack>
          )}
        </For>
      </Stack>
    </PageLayout>
  )
}
