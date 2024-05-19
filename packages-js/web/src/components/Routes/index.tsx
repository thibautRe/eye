import { Navigate, Route, Router } from "@solidjs/router"
import { Component, lazy as solidLazy, ParentComponent } from "solid-js"
import { useTrans } from "../../providers/I18n"
import { withAdminFence } from "../AuthFence"
import { PageLayout } from "../Layout/PageLayout"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"

export const routes = {
  Pictures: "/pictures",
  Picture: "/picture/:id",

  Albums: "/albums",
  Album: "/album/:id",

  Posts: "/p",
  Post: "/p/:slug",

  AdminRoot: "/admin",
  AdminUsers: "/admin/users",
  AdminJwtGen: "/admin/jwt_gen",
} as const

/** Creates a redirect component */
const r = (href: string) => () => <Navigate href={href} />

/** Rewraps Solid's lazy component with error logging in case chunks fail to run */
const lazy = (getter: () => Promise<{ default: Component }>) =>
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
const Posts = lazy(() => import("./PostListRoute"))
const Post = lazy(() => import("./PostRoute"))
const AdminRoot = withAdminFence(r(routes.AdminUsers))
const AdminUsers = withAdminFence(lazy(() => import("./Admin/UsersRoute")))
const AdminJwtGen = withAdminFence(lazy(() => import("./Admin/JwtGenRoute")))

export const AppRoutes = () => (
  <Router>
    <Route path={routes.Pictures} component={Pictures} />
    <Route path={routes.Picture} component={Picture} />
    <Route path={routes.Albums} component={Albums} />
    <Route path={routes.Album} component={Album} />
    <Route path={routes.Posts} component={Posts} />
    <Route path={routes.Post} component={Post} />

    {/* Convenience redirects */}
    <Route path={"/"} component={r(routes.Pictures)} />
    <Route path={"/picture/"} component={r(routes.Pictures)} />
    <Route path={"/album/"} component={r(routes.Albums)} />

    <Route path={routes.AdminRoot} component={AdminRoot} />
    <Route path={routes.AdminUsers} component={AdminUsers} />
    <Route path={routes.AdminJwtGen} component={AdminJwtGen} />
    <Route path="*" component={NotFoundRoute} />
  </Router>
)

// Error route helper
const Err: ParentComponent = p => (
  <PageLayout>
    <Stack j="center">
      <T t="l">{props => <h1 {...props}>{p.children}</h1>}</T>
    </Stack>
  </PageLayout>
)
export const NotFoundRoute = () => <Err>{useTrans()("notFound")}</Err>
export const UnauthorizedRoute = () => <Err>This content is private</Err>
export const MaintenanceRoute = () => (
  <Err>
    The website is not available right now. It will be back in a few minutes
  </Err>
)
