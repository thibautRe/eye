import { Navigate, Route, Routes } from "solid-app-router"
import { Component, lazy as solidLazy } from "solid-js"
import { withAdminFence } from "../AuthFence"

export const routes = {
  Pictures: "/pictures",
  Picture: "/picture/:id",

  Albums: "/albums",
  Album: "/album/:id",

  AdminRoot: "/admin",
  AdminUsers: "/admin/users",
  AdminJwtGen: "/admin/jwt_gen",
}

/** Creates a redirect component */
const r = (href: string) => () => <Navigate href={href} />

/** Rewraps Solid's lazy component with error logging in case chunks fail to run */
const lazy = (getter: () => Promise<{ default: Component<any> }>) =>
  solidLazy(() =>
    getter().catch(err => {
      console.error(err)
      throw err
    }),
  )

const Pictures = lazy(() => import("./PictureListRoute"))
const Picture = lazy(() => import("./PictureRoute"))
const Albums = lazy(() => import("./AlbumListRoute"))
const Album = lazy(() => import("./AlbumRoute"))
const AdminRoot = withAdminFence(r(routes.AdminUsers))
const AdminUsers = withAdminFence(lazy(() => import("./Admin/UsersRoute")))
const AdminJwtGen = withAdminFence(lazy(() => import("./Admin/JwtGen")))

export const AppRoutes = () => (
  <Routes>
    <Route path={routes.Pictures} component={Pictures} />
    <Route path={routes.Picture} component={Picture} />
    <Route path={routes.Albums} component={Albums} />
    <Route path={routes.Album} component={Album} />

    {/* Convenience redirects */}
    <Route path={"/"} component={r(routes.Albums)} />
    <Route path={"/picture/"} component={r(routes.Pictures)} />
    <Route path={"/album/"} component={r(routes.Albums)} />

    <Route path={routes.AdminRoot} component={AdminRoot} />
    <Route path={routes.AdminUsers} component={AdminUsers} />
    <Route path={routes.AdminJwtGen} component={AdminJwtGen} />
    <Route path="*" component={NotFoundRoute} />
  </Routes>
)

export const NotFoundRoute = () => <h1>Not found</h1>
export const UnauthorizedRoute = () => <h1>This content is private</h1>
export const MaintenanceRoute = () => (
  <h1>
    The website is not available right now. It will be back in an hour or two
  </h1>
)
