import { Navigate, Route, Routes } from "solid-app-router"
import { Component } from "solid-js"

export const routes = {
  Root: "/",

  AdminRoot: "/admin",
  AdminUsers: "/admin/users",
}

/** Creates a redirect component */
const r = (href: string) => () => <Navigate href={href} />

export const AppRoutes = () => (
  <Routes>
    <Route path={routes.Root} component={() => <h1>Home</h1>} />
    <Route path={routes.AdminRoot} component={r(routes.AdminUsers)} />
    <Route path={routes.AdminUsers} component={AdminUsers} />
  </Routes>
)

const AdminUsers: Component = () => {
  return <h1>Admin Users</h1>
}
