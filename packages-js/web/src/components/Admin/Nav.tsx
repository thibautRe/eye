import { A } from "@solidjs/router"
import { ParentComponent, VoidComponent } from "solid-js"
import { Box } from "../Box/Box"
import { routes } from "../Routes"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"
import { navcontainer, navlink } from "./Nav.css"

const AdminNavLink: ParentComponent<{ href: string }> = props => (
  <T t="s" fgColor="g10">
    {p => (
      <A href={props.href} classList={p.classList} class={navlink} {...p}>
        {props.children}
      </A>
    )}
  </T>
)

export const AdminNav: VoidComponent = () => (
  <Box p="m" bgColor="g3" br="m" class={navcontainer}>
    <Stack d="v" dist="xs">
      <AdminNavLink href={routes.AdminUsers}>Users</AdminNavLink>
      <AdminNavLink href={routes.AdminJwtGen}>JWT Gen</AdminNavLink>
    </Stack>
  </Box>
)
