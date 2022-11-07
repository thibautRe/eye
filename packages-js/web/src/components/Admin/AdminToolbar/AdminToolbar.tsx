import {
  createResource,
  ErrorBoundary,
  For,
  ParentComponent,
  Show,
  Suspense,
  VoidComponent,
} from "solid-js"
import { apiAdminJwtGen, apiAdminUsers } from "../../../api"
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
import { Box } from "../../Box/Box"
import { Button } from "../../Button"
import { Stack } from "../../Stack/Stack"
import { T } from "../../T/T"
import * as s from "./AdminToolbar.css"

const AdminToolbarWrapper: ParentComponent<{}> = p => {
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
      Logged in as:{" "}
      <Show
        when={isAdmin()}
        fallback={
          <Show
            when={isUnknown()}
            fallback={
              <Show when={user().type === "known" && (user() as KnownUser)}>
                {user => `User ID ${user.jwt.user_id}`}
              </Show>
            }
          >
            Public
          </Show>
        }
      >
        Admin
      </Show>
    </T>
  )
}

const AdminToolbarUsers: VoidComponent = () => {
  const [userRes] = createResource(apiAdminUsers)

  return (
    <Show when={userRes()}>
      {users => (
        <Stack d="v" dist="xs">
          <For each={users}>
            {user => (
              <Stack dist="s">
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

const AdminToolbarContent: VoidComponent = () => (
  <Stack d="v" dist="m">
    <AdminToolbarLoggedInAs />
    <Suspense>
      <ErrorBoundary fallback="">
        <AdminToolbarUsers />
      </ErrorBoundary>
    </Suspense>
    <Stack d="v" dist="s">
      <Show when={isKnown()}>
        <Button onClick={logOut}>Log in as public</Button>
      </Show>
      <Show when={!isAdmin()}>
        <Button onClick={logInAsStoredAdminX}>Log in as admin</Button>
      </Show>
    </Stack>
  </Stack>
)

const AdminToolbar: VoidComponent = () => {
  return (
    <AdminToolbarWrapper>
      <Stack d="v" dist="m" p="m">
        <T t="m">Admin Toolbar</T>
        <AdminToolbarContent />
      </Stack>
    </AdminToolbarWrapper>
  )
}

export default AdminToolbar