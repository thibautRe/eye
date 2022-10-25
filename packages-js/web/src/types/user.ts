import { Id } from "./id"

export interface UserApi {
  id: Id<"user">
  name: string
  email: string
}
