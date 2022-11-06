import { Component, ParentComponent, Show } from "solid-js"
import { isAdmin, isStoredAdmin } from "../providers/Identity"
import { UnauthorizedRoute } from "./Routes"

export const AdminFenceOptional: ParentComponent = p => (
  <Show when={isAdmin()}>{p.children}</Show>
)
export const StoredAdminFenceOptional: ParentComponent = p => (
  <Show when={isStoredAdmin()}>{p.children}</Show>
)

export function adminOptionalValue<T>(val: T): T | undefined {
  return isAdmin() ? val : undefined
}

const AdminFence: ParentComponent = p => {
  return (
    <Show when={isAdmin()} fallback={<UnauthorizedRoute />}>
      {p.children}
    </Show>
  )
}

export function withAdminFence<P>(InnerComponent: Component<P>): Component<P> {
  return (p: P) => (
    <AdminFence>
      <InnerComponent {...p} />
    </AdminFence>
  )
}
