import { Component, ParentComponent, Show } from "solid-js"
import { isAdmin } from "../providers/Identity"
import { UnauthorizedRoute } from "./Routes"

export const AdminFenceOptional: ParentComponent = p => {
  return <Show when={isAdmin()}>{p.children}</Show>
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
