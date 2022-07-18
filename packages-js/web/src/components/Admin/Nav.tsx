import { NavLink } from "solid-app-router"
import { ParentComponent, VoidComponent } from "solid-js"
import { classListToClass } from "../../utils/mergeStyle"
import { Box } from "../Box/Box"
import { routes } from "../Routes"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import { navcontainer, navlink } from "./Nav.css"

const AdminNavLink: ParentComponent<{ href: string }> = props => (
  <T t="s" fgColor="g10">
    {p => (
      <NavLink
        href={props.href}
        class={`${navlink} ${classListToClass(p.classList)}`}
        {...p}
      >
        {props.children}
      </NavLink>
    )}
  </T>
)

export const AdminNav: VoidComponent = () => (
  <Box p="m" bgColor="g3" br="m" class={navcontainer}>
    <Stack d="v" dist="xs" a="start">
      <AdminNavLink href={routes.AdminUsers}>Users</AdminNavLink>
      <AdminNavLink href={routes.AdminJwtGen}>JWT Gen</AdminNavLink>
    </Stack>
  </Box>
)
