import { Literal, Named, Static, Union } from "funtypes"

export const RoleSchema = Named(
  "Role",
  Union(Literal("admin"), Literal("user")),
)

export type Role = Static<typeof RoleSchema>
