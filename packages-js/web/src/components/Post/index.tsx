import { VoidComponent } from "solid-js"
import PostContentDescendants from "./PostContentDescendants"
import { PostApi } from "../../types/post"
import { Stack } from "../Stack/Stack"
import { lang } from "../../providers/I18n"

const Post: VoidComponent<{ post: PostApi }> = p => (
  <Stack d="v" dist="l">
    <Stack d="v" dist="s">
      <h1>{p.post.title}</h1>
      <time datetime={p.post.createdAt.toISOString()}>
        {p.post.createdAt.toLocaleString(lang(), {
          dateStyle: "long",
        })}
      </time>
    </Stack>
    <main>
      <PostContentDescendants
        children={p.post.content.children}
        includedPictureMap={
          new Map(p.post.includedPictures.map(pic => [pic.id, pic]))
        }
      />
    </main>
  </Stack>
)

export default Post
