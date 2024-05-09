import { Named, Number, ReadonlyObject, Static } from "funtypes"
import { jwtDecode } from "jwt-decode"
import { RoleSchema } from "./role"

export const JWTSchema = Named(
  "JWT",
  ReadonlyObject({
    user_id: Number,
    role: RoleSchema,
  }),
)
export type JWT = Static<typeof JWTSchema>

export const toJWT = (
  data: string,
): { ok: true; jwt: JWT } | { ok: false; msg: string } => {
  try {
    const decode = jwtDecode(data)
    const parsed = JWTSchema.safeParse(decode)
    if (parsed.success) return { ok: true, jwt: parsed.value }
    return { ok: false, msg: parsed.fullError?.join("\n") ?? parsed.message }
  } catch {
    return { ok: false, msg: "Cannot decode JWT: malformed" }
  }
}
