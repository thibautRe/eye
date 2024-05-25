import {
  createResource,
  ErrorBoundary,
  For,
  ParentComponent,
  Show,
  Suspense,
  VoidComponent,
} from "solid-js"
import { apiAdminJwtGen, apiAdminUsers, apiUploadPictures } from "../../../api"
import { setLang } from "../../../providers/I18n"
import {
  isAdmin,
  isKnown,
  isUnknown,
  KnownUser,
  logInAsStoredAdminX,
  logOut,
  updateIdentityX,
  user,
} from "../../../providers/Identity"
import { createEscKeySignal } from "../../../utils/hooks/createEscKeyHandler"
import { Button } from "../../Button"
import { Stack } from "../../Stack/Stack"
import { T } from "../../T/T"
import * as s from "./AdminToolbar.css"
import { AdminToolbarSeparator } from "./AdminToolbarSeparator"
import FileUploadButton from "../../Button/FileUploadButton"

const AdminToolbarWrapper: ParentComponent = p => {
  const [isOpen, { toggle }] = createEscKeySignal(false)
  return (
    <div classList={{ [s.wrapper]: true, [s.wrapperOpen]: isOpen() }}>
      <div class={s.triggerWrapper}>
        <div class={s.trigger} onClick={toggle}>
          <T t="xs">Admin Toolbar</T>
        </div>
      </div>
      <Show when={isOpen()}>{p.children}</Show>
    </div>
  )
}

const AdminToolbarLoggedInAs: VoidComponent = () => {
  return (
    <T t="xs">
      {props => (
        <span {...props}>
          Logged in as:{" "}
          <Show
            when={isAdmin()}
            fallback={
              <Show
                when={isUnknown()}
                fallback={
                  <Show when={user().type === "known" && (user() as KnownUser)}>
                    {user => `User ID ${user().jwt.user_id}`}
                  </Show>
                }
              >
                Public
              </Show>
            }
          >
            Admin
          </Show>
        </span>
      )}
    </T>
  )
}

const AdminToolbarLang: VoidComponent = () => (
  <Button onClick={() => setLang(l => (l === "fr" ? "en" : "fr"))}>
    Switch lang
  </Button>
)

const AdminToolbarUsers: VoidComponent = () => {
  const [userRes] = createResource(apiAdminUsers)

  return (
    <Show when={userRes()}>
      {users => (
        <Stack d="v" dist="xs" pt="s">
          <For each={users()}>
            {user => (
              <Stack dist="s" a="center">
                <T t="xs">{user.name}</T>
                <Button
                  onClick={async () => {
                    updateIdentityX(await apiAdminJwtGen(user.id))
                    window.location.reload()
                  }}
                >
                  Log in as
                </Button>
              </Stack>
            )}
          </For>
        </Stack>
      )}
    </Show>
  )
}

const AdminToolbarUpload: VoidComponent = () => (
  <FileUploadButton
    multiple
    accept=".jpg,.jpeg"
    onchange={async e => {
      if (!e.currentTarget.files) return
      await apiUploadPictures(e.currentTarget.files)
    }}
  >
    Upload picture
  </FileUploadButton>
)

const AdminToolbarContent: VoidComponent = () => (
  <Stack d="v" dist="m">
    <Suspense>
      <details>
        <summary>
          <AdminToolbarLoggedInAs />
        </summary>
        <Stack d="v" dist="xs">
          <ErrorBoundary fallback="">
            <AdminToolbarUsers />
          </ErrorBoundary>
          <Show when={isKnown()}>
            <Button onClick={logOut}>Log in as public</Button>
          </Show>
          <Show when={!isAdmin()}>
            <Button onClick={logInAsStoredAdminX}>Log in as admin</Button>
          </Show>
        </Stack>
      </details>
    </Suspense>
    <AdminToolbarLang />
    <AdminToolbarUpload />
  </Stack>
)

const AdminToolbar: ParentComponent = p => {
  return (
    <AdminToolbarWrapper>
      <Stack d="v" dist="m" p="m">
        <T t="m" fgColor="g11">
          Admin Toolbar
        </T>
        <AdminToolbarContent />

        <AdminToolbarSeparator />

        <ErrorBoundary fallback="Could not load extra actions">
          {p.children}
        </ErrorBoundary>
      </Stack>
    </AdminToolbarWrapper>
  )
}

export default AdminToolbar
