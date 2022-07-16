import { Component, ParentComponent, Show } from "solid-js"
import { isAdmin } from "../providers/Identity"

export const AdminFence: ParentComponent = p => {
  return (
    <Show when={isAdmin()} fallback={<h1>Access restricted</h1>}>
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
