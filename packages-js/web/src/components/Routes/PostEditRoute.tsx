import { redirect, useNavigate, useParams } from "@solidjs/router"
import { Match, Show, Switch, createResource, createSignal } from "solid-js"
import { apiGetPost, apiUpdatePost, apiUpdatePostSlug } from "../../api"
import { PageLayout } from "../Layout/PageLayout"
import { Stack } from "../Stack/Stack"
import PostEdit from "../Post/PostEdit"
import { Box } from "../Box/Box"
import Post from "../Post"
import { routes } from "."

type SaveStatus =
  | { state: "idle" }
  | { state: "saving"; startedAt: Date }
  | { state: "saved"; savedAt: Date }
  | { state: "error"; errorAt: Date; message: string }

export default () => {
  const params = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [postRes, postResActions] = createResource(
    () => params.slug,
    apiGetPost,
  )
  const [saveStatus, setSaveStatus] = createSignal<SaveStatus>({
    state: "idle",
  })

  let debouncedTimeout: number

  const update = ({ title, content }: { title: string; content: object }) => {
    clearTimeout(debouncedTimeout)
    setSaveStatus({ state: "saving", startedAt: new Date() })
    debouncedTimeout = setTimeout(async () => {
      try {
        const post = await apiUpdatePost(params.slug, {
          title,
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

  const updateContent = (content: object) => {
    const currPost = postRes()
    if (!currPost) throw new Error("Cannot find current post")
    return update({ content, title: currPost.title })
  }
  const updateTitle = (title: string) => {
    const currPost = postRes()
    if (!currPost) throw new Error("Cannot find current post")
    return update({ title, content: currPost.content })
  }
  const updateSlug = async (newSlug: string) => {
    const currPost = postRes()
    if (!currPost) throw new Error("Cannot find current post")
    const updated = await apiUpdatePostSlug(currPost.slug, newSlug)
    navigate(routes.PostEdit(updated.slug), { replace: true })
  }

  return (
    <PageLayout>
      <Show when={postRes()}>
        {post => (
          <Stack d="v" a="center" p="xl">
            <Stack dist="m" j="stretch" style={{ width: "1200px" }}>
              <Stack d="v" dist="xs" style={{ flex: 1 }}>
                <PostEdit
                  slug={post().slug}
                  title={post().title}
                  contentString={JSON.stringify(post().content, null, 2)}
                  onUpdateSlug={updateSlug}
                  onUpdateTitle={updateTitle}
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
