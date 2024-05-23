import { Show, VoidComponent, createSignal } from "solid-js"
import * as s from "./PostEdit.css"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"

const PostEdit: VoidComponent<{
  slug: string
  title: string
  contentString: string
  onUpdateSlug: (slug: string) => void
  onUpdateTitle: (title: string) => void
  onUpdateContent: (parsedContent: object) => void
}> = p => {
  // Local variable to make sure we're only calling onUpdateContentString with valid JSONs
  const [contentString, setContentString] = createSignal(p.contentString)

  const isValidJson = () => {
    try {
      JSON.parse(contentString())
      return true
    } catch (err) {
      return false
    }
  }

  return (
    <Stack d="v" dist="xs">
      <Stack a="center" dist="m">
        <T t="m">Slug:</T>
        <input
          class={s.input}
          value={p.slug}
          onchange={e => p.onUpdateSlug(e.target.value)}
        />
      </Stack>

      <Stack a="center" dist="m">
        <T t="m">Title:</T>
        <input
          class={s.input}
          value={p.title}
          onchange={e => p.onUpdateTitle(e.target.value)}
        />
      </Stack>
      <textarea
        class={s.textarea}
        value={contentString()}
        oninput={e => {
          setContentString(e.target.value)
          try {
            p.onUpdateContent(JSON.parse(contentString()))
          } catch (err) {
            // pass
          }
        }}
      />
      <Show when={!isValidJson()}>
        <T t="s" fgColor="p11">
          Invalid JSON
        </T>
      </Show>
    </Stack>
  )
}

export default PostEdit
