import { createSignal } from 'solid-js'

import { LSKeys } from '../../utils/localStorage'
import { JWT, toJWT } from './jwt'

export interface KnownUser {
  readonly type: 'known'
  readonly jwt: JWT
}
export interface UnknownUser {
  readonly type: 'unknown'
}
export type User = KnownUser | UnknownUser

const [user, setUser] = createSignal<User>({ type: 'unknown' })

export { user }

export const initIdentity = () => {
  const url = new URL(window.location.href)
  const hashParams = new URLSearchParams(url.hash.slice(1))
  const tk = hashParams.get('tk')
  if (tk) {
    hashParams.delete('tk')
    window.location.hash = hashParams.toString()

    const parsedJwt = toJWT(tk)
    if (parsedJwt.ok) {
      localStorage.setItem(LSKeys.JWT, tk)
      setUser({ type: 'known', jwt: parsedJwt.jwt })
    } else {
      throw new Error(`Cannot authenticate user: ${parsedJwt.msg}`)
    }

    return
  }

  const tkLs = localStorage.getItem(LSKeys.JWT)
  if (tkLs) {
    const parsedJwt = toJWT(tkLs)
    if (parsedJwt.ok) {
      setUser({ type: 'known', jwt: parsedJwt.jwt })
    } else {
      localStorage.removeItem(LSKeys.JWT)
      throw new Error(`Cannot authenticate user: ${parsedJwt.msg}`)
    }
  }
}
