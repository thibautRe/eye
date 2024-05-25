import { VoidComponent } from "solid-js"
import PostContentDescendants from "./PostContentDescendants"
import { PostApi } from "../../types/post"
import { Stack } from "../Stack/Stack"
import { lang } from "../../providers/I18n"
import { T } from "../T/T"

const Post: VoidComponent<{ post: PostApi }> = p => (
  <Stack d="v" dist="l">
    <Stack d="v" dist="s">
      <h1>{p.post.title}</h1>
      <T t="s" fgColor="g11">
        {props => (
          <time datetime={p.post.createdAt.toISOString()} {...props}>
            {p.post.createdAt.toLocaleString(lang(), {
              dateStyle: "long",
            })}
          </time>
        )}
      </T>
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
