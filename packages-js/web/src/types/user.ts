import { Id } from "./id"

export interface User {
  id: Id<"user">
  name: string
  email: string
}
