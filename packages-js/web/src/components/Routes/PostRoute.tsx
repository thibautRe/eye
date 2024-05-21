import { A, useParams } from "@solidjs/router"
import { PageLayout } from "../Layout/PageLayout"
import { Stack } from "../Stack/Stack"
import { Component, For, Show, createResource } from "solid-js"
import { apiGetPicture, apiGetPost, apiUpdatePost } from "../../api"
import { AspectRatioPicture } from "../Picture/AspectRatio"
import { Picture } from "../Picture"
import { Descendant, PostApi, PostContent } from "../../types/post"
import { Button } from "../Button"
import { Box } from "../Box/Box"
import { PictureApi } from "../../types/picture"
import { routes } from "."

export default () => {
  const params = useParams<{ slug: string }>()
  const [postRes, postResActions] = createResource(params.slug, apiGetPost)
  return (
    <PageLayout
      adminToolbarItems={<A href={routes.PostEdit(params.slug)}>Edit</A>}
    >
      <Stack d="v" dist="m">
        <Button
          onClick={async () => {
            const post = await apiUpdatePost(params.slug, {
              content: postContent,
            })
            postResActions.mutate(post)
          }}
        >
          Update
        </Button>

        <Show when={postRes()}>{post => <Post post={post()} />}</Show>
      </Stack>
    </PageLayout>
  )
}

const postContent: PostContent = {
  children: [
    { type: "text", text: "An interesting title" },
    {
      type: "paragraph",
      children: [
        { type: "text", text: "An interesting content" },
        { type: "picture", pictureId: 11 },
        { type: "picture", pictureId: 9 },
      ],
    },
  ],
}

const Post: Component<{ post: PostApi }> = p => {
  return (
    <Stack d="v" style={{ width: "650px", margin: "auto" }}>
      <Box>
        <PostContentDescendants
          children={p.post.content.children}
          includedPictureMap={
            new Map(p.post.includedPictures.map(pic => [pic.id, pic]))
          }
        />
      </Box>
    </Stack>
  )
}

const PostContentDescendants: Component<{
  children: readonly Descendant[]
  includedPictureMap: ReadonlyMap<PictureApi["id"], PictureApi>
}> = p => {
  return (
    <For each={p.children}>
      {item => {
        switch (item.type) {
          case "text":
            return <span>{item.text}</span>
          case "paragraph":
            return (
              <p>
                <PostContentDescendants {...p} children={item.children} />
              </p>
            )
          case "picture": {
            const picture = p.includedPictureMap.get(item.pictureId)
            if (!picture) return null

            return (
              <AspectRatioPicture picture={picture}>
                <Picture picture={picture} sizes="650px" />
              </AspectRatioPicture>
            )
          }
        }
      }}
    </For>
  )
}
