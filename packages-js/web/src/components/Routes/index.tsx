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

/** Creates a redirect component */
const r = (href: string) => () => <Navigate href={href} />

const Root = () => <h1>Home</h1>
const Pictures = lazy(() => import("./PictureListRoute"))
const Picture = lazy(() => import("./PictureRoute"))
const Album = lazy(() => import("./AlbumRoute"))
const AdminRoot = withAdminFence(r(routes.AdminUsers))
const AdminUsers = withAdminFence(lazy(() => import("./Admin/Users")))
const AdminJwtGen = withAdminFence(lazy(() => import("./Admin/JwtGen")))

export const AppRoutes = () => (
  <Routes>
    <Route path={routes.Root} component={Root} />
    <Route path={routes.Pictures} component={Pictures} />
    <Route path={routes.Picture} component={Picture} />
    <Route path={routes.Album} component={Album} />

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
