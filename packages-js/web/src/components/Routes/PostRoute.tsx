import { useParams } from "@solidjs/router"
import { PageLayout } from "../Layout/PageLayout"
import { Stack } from "../Stack/Stack"
import { Component, Show, createResource } from "solid-js"
import { apiGetPicture, apiGetPost, apiUpdatePost } from "../../api"
import { AspectRatioPicture } from "../Picture/AspectRatio"
import { Picture } from "../Picture"
import { PostApi, PostContent } from "../../types/post"
import { Button } from "../Button"
import { Box } from "../Box/Box"

export default () => {
  const params = useParams<{ slug: string }>()
  const [postRes] = createResource(params.slug, apiGetPost)
  return (
    <PageLayout>
      <Stack d="v" dist="m">
        <Show when={postRes()}>{post => <Post post={post()} />}</Show>
      </Stack>
    </PageLayout>
  )
}

// const postContent: PostContent = {
//   children: [
//     { type: "text", text: "An interesting title" },
//     {
//       type: "paragraph",
//       children: [
//         { type: "text", text: "An interesting content paragraph" },
//         { type: "picture", pictureId: 12 },
//       ],
//     },
//   ],
// }

const postContent: PostContent = {
  children: [{ type: "text", text: "An interesting title" }],
}

const Post: Component<{ post: PostApi }> = p => {
  return (
    <Stack d="v" style={{ width: "650px", margin: "auto" }}>
      <Box>
        <Button
          onClick={async () =>
            await apiUpdatePost(p.post.slug, { content: postContent })
          }
        >
          Update
        </Button>
      </Box>
      <h1>An interesting title</h1>
      <p>An interesting content</p>
      <PostPicture id={11} />
      <p>My little piopioppp</p>
      <PostPicture id={2} />
      <PostPicture id={4} />
    </Stack>
  )
}

const PostPicture: Component<{ id: number }> = p => {
  const [pictureRes] = createResource(p.id, apiGetPicture)
  return (
    <Show when={pictureRes()}>
      {picture => (
        <AspectRatioPicture picture={picture()}>
          <Picture picture={picture()} sizes="650px" />
        </AspectRatioPicture>
      )}
    </Show>
  )
}
