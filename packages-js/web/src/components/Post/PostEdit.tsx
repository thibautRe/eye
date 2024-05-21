import { VoidComponent, createSignal } from "solid-js"
import { PostContent } from "../../types/post"

const PostEdit: VoidComponent<{ content: PostContent }> = p => {
  const [contentString, setContentString] = createSignal(
    JSON.stringify(p.content, null, 2),
  )

  return (
    <textarea
      value={contentString()}
      onchange={e => setContentString(e.target.value)}
    />
  )
}

export default PostEdit
