import { createSignal } from "solid-js"
import { setApiClientJwt } from "../../api/client"

import { LSKeys } from "../../utils/localStorage"
import { JWT, toJWT } from "./jwt"

export interface KnownUser {
  readonly type: "known"
  readonly jwt: JWT
}
export interface UnknownUser {
  readonly type: "unknown"
}
export type User = KnownUser | UnknownUser

const [user, setUser] = createSignal<User>({ type: "unknown" })
const [adminUser, setAdminUser] = createSignal<User>({ type: "unknown" })

export { user }

const forceAdmin = location.hash.includes("force-admin")

export const isKnown = () => user().type === "known"
export const isUnknown = () => !isKnown()
export const isAdmin = () => {
  if (forceAdmin) return forceAdmin
  const u = user()
  return u.type === "known" && u.jwt.role === "admin"
}

// Used if stored admin user exists
export const isStoredAdmin = () => {
  const a = adminUser()
  return a.type === "known" && a.jwt.role === "admin"
}

export const updateIdentityX = (tk: string) => {
  const parsedJwt = toJWT(tk)
  if (parsedJwt.ok) {
    localStorage.setItem(LSKeys.JWT, tk)
    setApiClientJwt(tk)
    const user: KnownUser = { type: "known", jwt: parsedJwt.jwt }
    setUser(user)
    if (parsedJwt.jwt.role === "admin") {
      setAdminUser(user)
      localStorage.setItem(LSKeys.JWT_ADMIN, tk)
    }
  } else {
    throw new Error(`Cannot parse JWT: ${parsedJwt.msg}`)
  }
}
export const makeAuthUrl = (tk: string) =>
  `${location.protocol}//${location.host}/#tk=${tk}`

export const initIdentity = () => {
  const url = new URL(window.location.href)
  const hashParams = new URLSearchParams(url.hash.slice(1))
  const tk = hashParams.get("tk")
  if (tk) {
    hashParams.delete("tk")
    window.location.hash = hashParams.toString()
    updateIdentityX(tk)
    return
  }

  const tkLs = localStorage.getItem(LSKeys.JWT)
  if (tkLs) {
    const parsedJwt = toJWT(tkLs)
    if (parsedJwt.ok) {
      setApiClientJwt(tkLs)
      setUser({ type: "known", jwt: parsedJwt.jwt })
    } else {
      localStorage.removeItem(LSKeys.JWT)
      throw new Error(`Cannot authenticate user: ${parsedJwt.msg}`)
    }
  }

  const adminTkLs = localStorage.getItem(LSKeys.JWT_ADMIN)
  if (adminTkLs) {
    const parsedJwt = toJWT(adminTkLs)
    if (parsedJwt.ok) {
      setAdminUser({ type: "known", jwt: parsedJwt.jwt })
    }
  }
}

export const logInAsStoredAdminX = () => {
  const adminTkLs = localStorage.getItem(LSKeys.JWT_ADMIN)
  if (!adminTkLs) throw new Error("No stored Admin JWT in localstorage")
  updateIdentityX(adminTkLs)
  window.location.reload()
}

export const logOut = () => {
  localStorage.removeItem(LSKeys.JWT)
  window.location.reload()
}
