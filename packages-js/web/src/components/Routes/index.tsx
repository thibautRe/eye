import { Navigate, Route, Routes } from "solid-app-router"
import { lazy } from "solid-js"
import { withAdminFence } from "../AdminFence"

export const routes = {
  Root: "/",

  AdminRoot: "/admin",
  AdminUsers: "/admin/users",
  AdminGenJwt: "/admin/gen_jwt",
}

const AdminUsers = withAdminFence(lazy(() => import("./Admin/Users")))
const AdminGenJwt = withAdminFence(lazy(() => import("./Admin/GenJwt")))

/** Creates a redirect component */
const r = (href: string) => () => <Navigate href={href} />

export const AppRoutes = () => (
  <Routes>
    <Route path={routes.Root} component={() => <h1>Home</h1>} />
    <Route
      path={routes.AdminRoot}
      component={withAdminFence(r(routes.AdminUsers))}
    />
    <Route path={routes.AdminUsers} component={AdminUsers} />
    <Route path={routes.AdminGenJwt} component={AdminGenJwt} />
    <Route path="*" component={() => <h1>Not found</h1>} />
  </Routes>
)
