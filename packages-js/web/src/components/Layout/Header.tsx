import { Link } from "solid-app-router"
import { VoidComponent } from "solid-js"
import { EyeIcon } from "../Icons"
import { Stack } from "../Stack/Stack"
import { T } from "../T/T"

export const Header: VoidComponent = () => {
  return (
    <Stack dist="m" a="center" j="center" p="xl">
      {props => (
        <header {...props}>
          <Stack dist="m" a="center" fgColor="g11">
            {props => (
              <Link href="/" {...props}>
                <EyeIcon size={24} />
                <T
                  t="m"
                  w="bold"
                  style={{ "user-select": "none", "letter-spacing": "8px" }}
                >
                  EYE
                </T>
              </Link>
            )}
          </Stack>
        </header>
      )}
    </Stack>
  )
}
