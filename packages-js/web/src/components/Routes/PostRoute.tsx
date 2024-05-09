import { useParams } from "@solidjs/router"
import { PageLayout } from "../Layout/PageLayout"
import { Stack } from "../Stack/Stack"
import { Component, Show, createResource } from "solid-js"
import { apiGetPicture } from "../../api"
import { AspectRatioPicture } from "../Picture/AspectRatio"
import { Picture } from "../Picture"

export default () => {
  const params = useParams<{ id: string }>()
  return (
    <PageLayout>
      <Stack d="v" dist="m">
        <Post />
      </Stack>
    </PageLayout>
  )
}

const Post = () => {
  return (
    <Stack d="v" style={{ width: "650px", margin: "auto" }}>
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
