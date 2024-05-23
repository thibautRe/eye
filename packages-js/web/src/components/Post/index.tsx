import { VoidComponent } from "solid-js"
import PostContentDescendants from "./PostContentDescendants"
import { PostApi } from "../../types/post"

const Post: VoidComponent<{ post: PostApi }> = p => (
  <PostContentDescendants
    children={p.post.content.children}
    includedPictureMap={
      new Map(p.post.includedPictures.map(pic => [pic.id, pic]))
    }
  />
)

export default Post
