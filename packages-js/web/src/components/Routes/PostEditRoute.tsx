import { useParams } from "@solidjs/router"
import { Match, Show, Switch, createResource, createSignal } from "solid-js"
import { apiGetPost, apiUpdatePost } from "../../api"
import { PageLayout } from "../Layout/PageLayout"
import { Stack } from "../Stack/Stack"
import PostEdit from "../Post/PostEdit"
import { Box } from "../Box/Box"
import Post from "../Post"

type SaveStatus =
  | { state: "idle" }
  | { state: "saving"; startedAt: Date }
  | { state: "saved"; savedAt: Date }
  | { state: "error"; errorAt: Date; message: string }

export default () => {
  const params = useParams<{ slug: string }>()
  const [postRes, postResActions] = createResource(params.slug, apiGetPost)
  const [saveStatus, setSaveStatus] = createSignal<SaveStatus>({
    state: "idle",
  })

  let debouncedTimeout: number

  const updateContent = (content: object) => {
    clearTimeout(debouncedTimeout)
    setSaveStatus({ state: "saving", startedAt: new Date() })
    debouncedTimeout = setTimeout(async () => {
      try {
        const post = await apiUpdatePost(params.slug, {
          // @ts-expect-error content is object but cannot definitely be assigned to PostContent
          content,
        })
        setSaveStatus({ state: "saved", savedAt: new Date() })
        postResActions.mutate(post)
      } catch (err: any) {
        console.error("Error while saving post:", err)
        setSaveStatus({
          state: "error",
          errorAt: new Date(),
          message: err.toString(),
        })
      }
    }, 500)
  }

  return (
    <PageLayout>
      <Show when={postRes()}>
        {post => (
          <Stack d="v" a="center" p="xl">
            <Stack dist="m" j="stretch" style={{ width: "1200px" }}>
              <Stack d="v" dist="xs" style={{ flex: 1 }}>
                <PostEdit
                  contentString={JSON.stringify(post().content, null, 2)}
                  onUpdateContent={updateContent}
                />

                <Switch>
                  <Match when={saveStatus().state === "saved"}>Saved</Match>
                  <Match when={saveStatus().state === "saving"}>
                    Saving...
                  </Match>
                  <Match when={saveStatus().state === "error"}>Error</Match>
                </Switch>
              </Stack>
              <Box style={{ flex: 1 }}>
                <Post post={post()} />
              </Box>
            </Stack>
          </Stack>
        )}
      </Show>
    </PageLayout>
  )
}
