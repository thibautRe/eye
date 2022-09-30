import { Navigate, Route, Routes } from "solid-app-router"
import { lazy } from "solid-js"
import { withAdminFence } from "../AuthFence"

export const routes = {
  Root: "/",

  Pictures: "/pictures",
  Picture: "/picture/:id",

  Album: "/album/:id",

  AdminRoot: "/admin",
  AdminUsers: "/admin/users",
  AdminJwtGen: "/admin/jwt_gen",
}

const Pictures = lazy(() => import("./PictureListRoute"))
const Picture = lazy(() => import("./PictureRoute"))
const Album = lazy(() => import("./AlbumRoute"))
const AdminUsers = withAdminFence(lazy(() => import("./Admin/Users")))
const AdminJwtGen = withAdminFence(lazy(() => import("./Admin/JwtGen")))

/** Creates a redirect component */
const r = (href: string) => () => <Navigate href={href} />

export const AppRoutes = () => (
  <Routes>
    <Route path={routes.Root} component={() => <h1>Home</h1>} />
    <Route path={routes.Pictures} component={Pictures} />
    <Route path={routes.Picture} component={Picture} />
    <Route path={routes.Album} component={Album} />

    <Route
      path={routes.AdminRoot}
      component={withAdminFence(r(routes.AdminUsers))}
    />
    <Route path={routes.AdminUsers} component={AdminUsers} />
    <Route path={routes.AdminJwtGen} component={AdminJwtGen} />
    <Route path="*" component={() => <h1>Not found</h1>} />
  </Routes>
)
