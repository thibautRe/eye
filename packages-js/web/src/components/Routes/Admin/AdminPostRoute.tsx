import { AdminContainer } from "../../Admin/Container"
import { PageTitle } from "../../Admin/PageTitle"
import { Stack } from "../../Stack/Stack"

export default () => {
  return (
    <AdminContainer>
      <Stack dist="m" a="center">
        <PageTitle>Post</PageTitle>
      </Stack>
    </AdminContainer>
  )
}
