import { VoidComponent } from "solid-js"
import { Box } from "../../Box/Box"
import * as s from "./AdminToolbarSeparator.css"

export const AdminToolbarSeparator: VoidComponent = () => (
  <Box class={s.separator} bgColor="g7">
    {props => <hr {...props} />}
  </Box>
)
